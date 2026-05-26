# MatchStake Fan Liquidity Hook

This is the custom Uniswap V4 hook concept for OKX X Cup.

## What it does

`contracts/contracts/FanLiquidityHook.sol` turns swap/liquidity activity into World Cup prediction rewards:

1. **AI-managed dynamic fees**
   - Rogue / AI co-pilot writes match confidence and upset risk through `updateMatchSignal()`.
   - The hook converts those signals into a dynamic fee using `_feeFromSignal()`.
   - Higher upset risk means more fee credit routed into prediction reward pools.

2. **Social prediction liquidity pools**
   - `configurePool()` maps a pool to a match + room.
   - `afterSwapCredit()` is the demo-safe stand-in for Uniswap V4 `afterSwap`.
   - Swap volume creates `fanCredit` for the mapped room, boosted by `socialMultiplierBps`.

3. **Conditional prediction liquidity**
   - `routePredictionLiquidity()` routes staking/liquidity intent into HOME_WIN / AWAY_WIN / DRAW buckets.
   - Social multipliers boost liquidity from squads/watch parties.

4. **Dynamic NFT interaction**
   - `syncPredictionNFT()` can update a prediction NFT after hook-triggered liquidity/prediction events.

## Why it fits the hackathon

- World Cup themed: each hook pool maps to a match and prediction room.
- Trading: swap activity funds/credits prediction pools.
- Social: rooms and squads get multipliers.
- AI Agent: fee parameters change from AI match analysis.
- NFT/GameFi: prediction NFT state can sync with hook events.
- X Layer: deployable with the existing Hardhat X Layer testnet script.

## Real V4 integration path

The current contract is compile-safe inside the Hardhat repo without importing the full Uniswap V4 Foundry stack. To convert it into a production V4 hook:

- Install Uniswap V4 `v4-core` + `v4-periphery` in a Foundry workspace.
- Inherit `BaseHook`.
- Move `afterSwapCredit()` logic into `_afterSwap(...)`.
- Move dynamic fee return into `_beforeSwap(...)` / dynamic-fee pool integration.
- Derive `poolId`, `tokenIn`, `tokenOut`, and `amountIn` from `PoolKey`, `SwapParams`, and `BalanceDelta`.

The economic logic is already isolated in `quoteDynamicFee()`, `routePredictionLiquidity()`, and room credit accounting.
