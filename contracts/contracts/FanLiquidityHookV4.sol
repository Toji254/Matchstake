// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IHooks} from "../vendor/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "../vendor/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "../vendor/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "../vendor/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "../vendor/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "../vendor/v4-core/src/types/BeforeSwapDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "../vendor/v4-core/src/types/PoolOperation.sol";
import {LPFeeLibrary} from "../vendor/v4-core/src/libraries/LPFeeLibrary.sol";

interface IHookPredictionNFT {
    function resolve(uint256 tokenId, uint256 pointsEarned, bool isWinner) external;
}

/// @title FanLiquidityHookV4
/// @notice A real Uniswap v4 IHooks implementation:
///         - Dynamic LP fee override via beforeSwap (for dynamic-fee pools)
///         - After-swap fan credit accounting (afterSwap)
///         - Room outcome liquidity routing (callable by owner/operator)
///         - Optional NFT sync (callable by owner/operator)
///
/// IMPORTANT: To be a valid v4 hook address, deploy this contract via CREATE2 so the address low bits
/// encode the hook permissions (Hooks library checks address bits).
contract FanLiquidityHookV4 is IHooks {
    using PoolIdLibrary for PoolKey;

    address public owner;
    address public aiOperator;
    address public predictionNFT;

    IPoolManager public immutable poolManager;

    // Fee modeling in hundredths of a bip (1e6 = 100%).
    uint24 public constant MIN_FEE = 500; // 0.05%
    uint24 public constant MAX_FEE = 10000; // 1.00%
    uint24 public baseFee = 3000; // 0.30%

    enum Result { PENDING, HOME_WIN, AWAY_WIN, DRAW }

    struct MatchSignal {
        uint16 confidence; // 0-10000, where 7200 = 72%
        uint16 upsetRisk;  // 0-10000
        uint24 recommendedFee; // 0-1e6
        uint40 updatedAt;
        bool active;
    }

    struct PoolConfig {
        uint256 matchId;
        uint256 roomId;
        uint16 socialMultiplierBps; // 10000 = 1x, 12500 = 1.25x
        bool active;
    }

    struct RoomCredit {
        uint256 totalCredits;
        uint256 swapCount;
        uint256 liquidityActions;
        uint256 lastUpdated;
    }

    mapping(PoolId => PoolConfig) public poolConfigs;
    mapping(uint256 => MatchSignal) public matchSignals;
    mapping(uint256 => RoomCredit) public roomCredits;
    mapping(address => uint256) public traderCredits;
    mapping(uint256 => mapping(Result => uint256)) public outcomeLiquidity;

    event PoolConfigured(PoolId indexed poolId, uint256 indexed matchId, uint256 indexed roomId, uint16 socialMultiplierBps);
    event AIMatchSignalUpdated(uint256 indexed matchId, uint16 confidence, uint16 upsetRisk, uint24 recommendedFee);
    event DynamicFeeQuoted(PoolId indexed poolId, uint256 indexed matchId, uint24 fee);
    event FanSwapCredited(uint256 indexed roomId, address indexed trader, int128 amount0, int128 amount1, uint256 fanCredit, uint24 fee);
    event PredictionLiquidityRouted(uint256 indexed roomId, address indexed provider, Result indexed outcome, uint256 amount, uint256 boostedAmount);
    event PredictionNFTSynced(uint256 indexed tokenId, uint256 indexed roomId, uint256 pointsEarned, bool isWinner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAI() {
        require(msg.sender == aiOperator || msg.sender == owner, "Not AI operator");
        _;
    }

    modifier onlyPoolManager() {
        require(msg.sender == address(poolManager), "Only PoolManager");
        _;
    }

    constructor(IPoolManager _poolManager, address _owner, address _aiOperator, address _predictionNFT) {
        poolManager = _poolManager;
        owner = _owner == address(0) ? msg.sender : _owner;
        aiOperator = _aiOperator == address(0) ? owner : _aiOperator;
        predictionNFT = _predictionNFT;
    }

    // ---------------------------
    // Admin / configuration
    // ---------------------------

    function setAIOperator(address nextOperator) external onlyOwner {
        require(nextOperator != address(0), "Invalid operator");
        aiOperator = nextOperator;
    }

    function setPredictionNFT(address nextPredictionNFT) external onlyOwner {
        predictionNFT = nextPredictionNFT;
    }

    function configurePool(PoolKey calldata key, uint256 matchId, uint256 roomId, uint16 socialMultiplierBps)
        external
        onlyOwner
    {
        require(matchId != 0 && roomId != 0, "Invalid ids");
        require(socialMultiplierBps >= 10000 && socialMultiplierBps <= 30000, "Bad multiplier");

        PoolId poolId = key.toId();
        poolConfigs[poolId] = PoolConfig({
            matchId: matchId,
            roomId: roomId,
            socialMultiplierBps: socialMultiplierBps,
            active: true
        });

        emit PoolConfigured(poolId, matchId, roomId, socialMultiplierBps);
    }

    function updateMatchSignal(uint256 matchId, uint16 confidence, uint16 upsetRisk) external onlyAI {
        require(matchId != 0, "Invalid match");
        require(confidence <= 10000 && upsetRisk <= 10000, "Out of range");

        uint24 recommended = _feeFromSignal(confidence, upsetRisk);
        matchSignals[matchId] = MatchSignal({
            confidence: confidence,
            upsetRisk: upsetRisk,
            recommendedFee: recommended,
            updatedAt: uint40(block.timestamp),
            active: true
        });

        emit AIMatchSignalUpdated(matchId, confidence, upsetRisk, recommended);
    }

    function quoteDynamicFee(PoolId poolId) public returns (uint24 fee) {
        PoolConfig memory config = poolConfigs[poolId];
        if (!config.active) {
            emit DynamicFeeQuoted(poolId, 0, baseFee);
            return baseFee;
        }

        MatchSignal memory signal = matchSignals[config.matchId];
        fee = signal.active ? signal.recommendedFee : baseFee;
        emit DynamicFeeQuoted(poolId, config.matchId, fee);
    }

    function routePredictionLiquidity(PoolKey calldata key, address provider, Result predictedOutcome, uint256 amount)
        external
        onlyOwner
        returns (uint256 boostedAmount)
    {
        PoolId poolId = key.toId();
        PoolConfig memory config = poolConfigs[poolId];
        require(config.active, "Pool not configured");
        require(provider != address(0), "Invalid provider");
        require(predictedOutcome != Result.PENDING, "Pending outcome");
        require(amount > 0, "No amount");

        boostedAmount = (amount * config.socialMultiplierBps) / 10000;
        outcomeLiquidity[config.roomId][predictedOutcome] += boostedAmount;

        RoomCredit storage credit = roomCredits[config.roomId];
        credit.liquidityActions += 1;
        credit.lastUpdated = block.timestamp;

        emit PredictionLiquidityRouted(config.roomId, provider, predictedOutcome, amount, boostedAmount);
    }

    function syncPredictionNFT(uint256 roomId, uint256 tokenId, uint256 pointsEarned, bool isWinner) external onlyOwner {
        require(predictionNFT != address(0), "NFT not set");
        IHookPredictionNFT(predictionNFT).resolve(tokenId, pointsEarned, isWinner);
        emit PredictionNFTSynced(tokenId, roomId, pointsEarned, isWinner);
    }

    // ---------------------------
    // IHooks implementation
    // ---------------------------

    function beforeInitialize(address, PoolKey calldata, uint160) external pure returns (bytes4) {
        return IHooks.beforeInitialize.selector;
    }

    function afterInitialize(address, PoolKey calldata, uint160, int24) external pure returns (bytes4) {
        return IHooks.afterInitialize.selector;
    }

    function beforeAddLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        return IHooks.beforeAddLiquidity.selector;
    }

    function afterAddLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, BalanceDelta, BalanceDelta, bytes calldata)
        external
        pure
        returns (bytes4, BalanceDelta)
    {
        return (IHooks.afterAddLiquidity.selector, BalanceDelta.wrap(0));
    }

    function beforeRemoveLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        return IHooks.beforeRemoveLiquidity.selector;
    }

    function afterRemoveLiquidity(address, PoolKey calldata, ModifyLiquidityParams calldata, BalanceDelta, BalanceDelta, bytes calldata)
        external
        pure
        returns (bytes4, BalanceDelta)
    {
        return (IHooks.afterRemoveLiquidity.selector, BalanceDelta.wrap(0));
    }

    function beforeSwap(address, PoolKey calldata key, SwapParams calldata, bytes calldata)
        external
        onlyPoolManager
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        // Only meaningful for dynamic-fee pools. For static fee pools, the manager ignores the fee override.
        PoolId poolId = key.toId();
        uint24 fee = quoteDynamicFee(poolId);

        // Signal to override fee: set OVERRIDE_FEE_FLAG.
        uint24 feeOverride = (LPFeeLibrary.OVERRIDE_FEE_FLAG | fee);
        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, feeOverride);
    }

    function afterSwap(address, PoolKey calldata key, SwapParams calldata, BalanceDelta delta, bytes calldata)
        external
        onlyPoolManager
        returns (bytes4, int128)
    {
        PoolId poolId = key.toId();
        PoolConfig memory config = poolConfigs[poolId];
        if (!config.active) {
            return (IHooks.afterSwap.selector, 0);
        }

        // delta.amount0/amount1 are int128 packed into BalanceDelta.
        // We don't need token addresses here for eligibility; we just credit a "fanCredit" based on absolute delta.
        (int128 amount0, int128 amount1) = (delta.amount0(), delta.amount1());

        uint24 fee = matchSignals[config.matchId].active ? matchSignals[config.matchId].recommendedFee : baseFee;

        // fanCredit is a simple score proxy: abs(amount0)+abs(amount1) scaled by fee and social multiplier.
        uint256 abs0 = amount0 < 0 ? uint256(uint128(-amount0)) : uint256(uint128(amount0));
        uint256 abs1 = amount1 < 0 ? uint256(uint128(-amount1)) : uint256(uint128(amount1));
        uint256 notional = abs0 + abs1;

        uint256 fanCredit = (notional * fee * config.socialMultiplierBps) / 1_000_000 / 10_000;
        if (fanCredit == 0 && notional > 0) fanCredit = 1;

        RoomCredit storage credit = roomCredits[config.roomId];
        credit.totalCredits += fanCredit;
        credit.swapCount += 1;
        credit.lastUpdated = block.timestamp;

        traderCredits[tx.origin] += fanCredit;

        emit FanSwapCredited(config.roomId, tx.origin, amount0, amount1, fanCredit, fee);
        return (IHooks.afterSwap.selector, 0);
    }

    function beforeDonate(address, PoolKey calldata, uint256, uint256, bytes calldata) external pure returns (bytes4) {
        return IHooks.beforeDonate.selector;
    }

    function afterDonate(address, PoolKey calldata, uint256, uint256, bytes calldata) external pure returns (bytes4) {
        return IHooks.afterDonate.selector;
    }

    function _feeFromSignal(uint16 confidence, uint16 upsetRisk) internal view returns (uint24) {
        // Upset risk pushes fee up; high confidence pushes fee down slightly.
        uint256 fee = baseFee;
        fee += (uint256(upsetRisk) * 4500) / 10000; // + up to 0.45%

        if (confidence < 6000) fee += 2000;         // +0.20%
        else if (confidence > 8000 && fee > 1000) fee -= 1000; // -0.10%

        if (fee < MIN_FEE) fee = MIN_FEE;
        if (fee > MAX_FEE) fee = MAX_FEE;
        return uint24(fee);
    }
}

