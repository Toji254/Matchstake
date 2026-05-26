// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IHookPredictionNFT {
    function resolve(uint256 tokenId, uint256 pointsEarned, bool isWinner) external;
}

/// @title FanLiquidityHook
/// @notice MatchStake's X Cup social/prediction staking hook prototype.
/// @dev Compile-safe without importing v4-core, but shaped so the accounting can move into a
///      Uniswap V4 afterSwap / beforeAddLiquidity hook. The hook connects three judging angles:
///      dynamic AI fees, prediction liquidity routing, and dynamic NFT state updates.
contract FanLiquidityHook {
    address public owner;
    address public aiOperator;
    address public predictionNFT;
    uint256 public totalFanCredits;

    uint24 public constant MIN_FEE_BPS = 5; // 0.05%
    uint24 public constant MAX_FEE_BPS = 100; // 1.00%
    uint24 public baseFeeBps = 30; // 0.30%

    enum Result { PENDING, HOME_WIN, AWAY_WIN, DRAW }

    struct MatchSignal {
        uint16 confidence; // 0-10000, where 7200 = 72%
        uint16 upsetRisk; // 0-10000
        uint24 recommendedFeeBps;
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

    mapping(bytes32 => PoolConfig) public poolConfigs;
    mapping(uint256 => MatchSignal) public matchSignals;
    mapping(uint256 => RoomCredit) public roomCredits;
    mapping(address => uint256) public traderCredits;
    mapping(uint256 => mapping(Result => uint256)) public outcomeLiquidity;

    event PoolConfigured(bytes32 indexed poolId, uint256 indexed matchId, uint256 indexed roomId, uint16 socialMultiplierBps);
    event AIMatchSignalUpdated(uint256 indexed matchId, uint16 confidence, uint16 upsetRisk, uint24 recommendedFeeBps);
    event DynamicFeeQuoted(bytes32 indexed poolId, uint256 indexed matchId, uint24 feeBps);
    event FanSwapCredited(uint256 indexed roomId, address indexed trader, address indexed tokenIn, address tokenOut, uint256 amountIn, uint256 fanCredit, uint24 feeBps);
    event PredictionLiquidityRouted(uint256 indexed roomId, address indexed provider, Result indexed outcome, uint256 amount, uint256 boostedAmount);
    event PredictionNFTSynced(uint256 indexed tokenId, uint256 indexed roomId, uint256 pointsEarned, bool isWinner);
    event RewardRoomFunded(uint256 indexed roomId, uint256 totalCredits, uint256 swapCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAI() {
        require(msg.sender == aiOperator || msg.sender == owner, "Not AI operator");
        _;
    }

    constructor(address _predictionNFT) {
        owner = msg.sender;
        aiOperator = msg.sender;
        predictionNFT = _predictionNFT;
    }

    function setPredictionNFT(address nextPredictionNFT) external onlyOwner {
        predictionNFT = nextPredictionNFT;
    }

    function setAIOperator(address nextOperator) external onlyOwner {
        require(nextOperator != address(0), "Invalid operator");
        aiOperator = nextOperator;
    }

    function configurePool(bytes32 poolId, uint256 matchId, uint256 roomId, uint16 socialMultiplierBps) external onlyOwner {
        require(poolId != bytes32(0), "Invalid pool");
        require(matchId != 0 && roomId != 0, "Invalid ids");
        require(socialMultiplierBps >= 10000 && socialMultiplierBps <= 30000, "Bad multiplier");

        poolConfigs[poolId] = PoolConfig({
            matchId: matchId,
            roomId: roomId,
            socialMultiplierBps: socialMultiplierBps,
            active: true
        });

        emit PoolConfigured(poolId, matchId, roomId, socialMultiplierBps);
    }

    /// @notice Rogue/AI co-pilot oracle writes match volatility to control hook parameters.
    function updateMatchSignal(uint256 matchId, uint16 confidence, uint16 upsetRisk) external onlyAI {
        require(matchId != 0, "Invalid match");
        require(confidence <= 10000 && upsetRisk <= 10000, "Out of range");

        uint24 recommended = _feeFromSignal(confidence, upsetRisk);
        matchSignals[matchId] = MatchSignal({
            confidence: confidence,
            upsetRisk: upsetRisk,
            recommendedFeeBps: recommended,
            updatedAt: uint40(block.timestamp),
            active: true
        });

        emit AIMatchSignalUpdated(matchId, confidence, upsetRisk, recommended);
    }

    function quoteDynamicFee(bytes32 poolId) public returns (uint24) {
        PoolConfig memory config = poolConfigs[poolId];
        if (!config.active) {
            emit DynamicFeeQuoted(poolId, 0, baseFeeBps);
            return baseFeeBps;
        }

        MatchSignal memory signal = matchSignals[config.matchId];
        uint24 fee = signal.active ? signal.recommendedFeeBps : baseFeeBps;
        emit DynamicFeeQuoted(poolId, config.matchId, fee);
        return fee;
    }

    /// @notice Demo-safe stand-in for Uniswap V4 afterSwap.
    /// @dev A real hook would derive amountIn/token deltas from BalanceDelta + PoolKey.
    function afterSwapCredit(
        bytes32 poolId,
        address trader,
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external onlyOwner returns (uint256 fanCredit) {
        PoolConfig memory config = poolConfigs[poolId];
        require(config.active, "Pool not configured");
        require(trader != address(0), "Invalid trader");
        require(amountIn > 0, "No amount");

        uint24 feeBps = quoteDynamicFee(poolId);
        fanCredit = (amountIn * feeBps * config.socialMultiplierBps) / 10000 / 10000;
        if (fanCredit == 0) fanCredit = 1;

        RoomCredit storage credit = roomCredits[config.roomId];
        credit.totalCredits += fanCredit;
        credit.swapCount += 1;
        credit.lastUpdated = block.timestamp;

        traderCredits[trader] += fanCredit;
        totalFanCredits += fanCredit;

        emit FanSwapCredited(config.roomId, trader, tokenIn, tokenOut, amountIn, fanCredit, feeBps);
        emit RewardRoomFunded(config.roomId, credit.totalCredits, credit.swapCount);
    }

    /// @notice Routes staking/liquidity intent into outcome buckets with social multipliers.
    function routePredictionLiquidity(
        bytes32 poolId,
        address provider,
        Result predictedOutcome,
        uint256 amount
    ) external onlyOwner returns (uint256 boostedAmount) {
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

    /// @notice Lets the hook synchronize dynamic prediction NFT state after a prediction-liquidity event.
    function syncPredictionNFT(uint256 roomId, uint256 tokenId, uint256 pointsEarned, bool isWinner) external onlyOwner {
        require(predictionNFT != address(0), "NFT not set");
        IHookPredictionNFT(predictionNFT).resolve(tokenId, pointsEarned, isWinner);
        emit PredictionNFTSynced(tokenId, roomId, pointsEarned, isWinner);
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        require(nextOwner != address(0), "Invalid owner");
        owner = nextOwner;
    }

    function _feeFromSignal(uint16 confidence, uint16 upsetRisk) internal view returns (uint24) {
        uint256 fee = baseFeeBps;

        // Higher upset risk = more fee directed into the prediction reward pool.
        fee += (uint256(upsetRisk) * 45) / 10000;

        // High-confidence favorites produce tighter spreads; low confidence increases fee.
        if (confidence < 6000) fee += 20;
        else if (confidence > 8000 && fee > 10) fee -= 10;

        if (fee < MIN_FEE_BPS) fee = MIN_FEE_BPS;
        if (fee > MAX_FEE_BPS) fee = MAX_FEE_BPS;
        return uint24(fee);
    }
}
