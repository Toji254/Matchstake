# MatchStake — OKX X Cup Hackathon Submission

**MatchStake** is a decentralized, social watch party staking protocol for the FIFA World Cup 2026, built exclusively on the **OKX X Layer** network. Featuring a premium monochrome sci-fi editorial aesthetic, MatchStake combines real-time group chat rooms, dynamic live-updating prediction NFTs, and an on-device AI Co-Pilot, powered directly by OKX's latest **Exchange OS**, **Onchain OS**, and a custom **Uniswap v4 Hook** architecture.

---

> [!IMPORTANT]
> ### 🏆 Hackathon Judges: Exchange OS & Onchain OS Highlight
> MatchStake is engineered directly around the new OKX developer frameworks to deliver institutional-grade performance and an autonomous agent ecosystem:
> 
> * **Exchange OS Upgrade Integration:** Rather than rebuilding a custom matching ledger, MatchStake deploys permissionless sports prediction and outcome venues using the open **Exchange OS** core. It leverages their high-performance EVM-based order book matching, oracles, outcome assets, and automated revenue share contracts on the X Layer.
> * **Onchain OS Core Integration:** Provides the **AI Agentic Wallet** capabilities, including **NLP Natural Language Command Parsing** ("Bet 0.1 OKB on France"), plug-and-play **Skills** modules (`npx skills add okx/onchainos-skills`), decentralized **DEX swap aggregation routing**, and **x402 zero-gas agent payments** on X Layer.
> * **Custom Fan Liquidity Hook (`FanLiquidityHook.sol`):** A custom solidity hook that coordinates prediction pools, social multipliers, dynamically scaled swap fees based on AI match volatility telemetry, and dynamic NFT triggers.

---

## 🗺️ Protocol Architecture & Flow

```text
                  ┌─────────────────────────────────────────────────┐
                  │          USER // OKX WEB3 WALLET                │
                  └────────────────────────┬────────────────────────┘
                                           │ (Connect & Approve)
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             MATCHSTAKE CORE PROTOCOL                             │
├───────────────────────┬─────────────────────────┬────────────────────────────────┤
│  [1] EXCHANGE OS      │  [2] ONCHAIN OS ENGINE  │  [3] FAN LIQUIDITY HOOK        │
│  (Outcome Venues)     │  (Agent & Skills SDK)   │  (Match Telemetry Pools)       │
├───────────────────────┼─────────────────────────┼────────────────────────────────┤
│ ● Order Book Matching │ ● NLP Command Parsing   │ ● AI Dynamic Fee Signals       │
│ ● EVM Outcome Assets  │ ● DEX Swap Routing      │ ● Social Multiplier Credits    │
│ ● OKLink Oracles      │ ● x402 Gasless Payments │ ● Prediction NFT State Sync    │
│ ● Revenue Fee Splits  │ ● plug-and-play Skills  │ ● Outcome Liquidity Routing    │
└───────────────────────┴───────────┬─────────────┴───────────────┬────────────────┘
                                    │                             │
                                    │       DECOMPILING TO        │
                                    └──────────────┬──────────────┘
                                                   ▼
                  ┌─────────────────────────────────────────────────┐
                  │                 OKX X LAYER                     │
                  │   (EVM ZK-Rollup — Chain ID 195 Testnet/Mainnet) │
                  └─────────────────────────────────────────────────┘
```

---

## 🛠️ OKX OS Integration Workspaces

The platform features a dedicated **OS Operations Control Center** (`/agent-ops`) that visualizes and configures these capabilities in real-time:

### 1. Exchange OS Outcome Markets
MatchStake integrates Exchange OS's open infrastructure to allow organizers to launch custom outcome markets for match results, goal spreads, and tournament brackets without writing low-level order books:
* **Outcome Asset Configuration:** Custom sports events (e.g., *Argentina vs France — Win Outcome*) are compiled directly into on-chain outcome tokens.
* **Oracles & Resolution:** Integrated with **OKLink API** and Chainlink multi-sigs for zero-trust, off-chain sports telemetry resolution.
* **Matching Protocols:** Supports Limit Order Book matching modes or social AMM liquidity models.
* **Fee Monetization:** Custom venue fees (e.g., 0.5% protocol cut) are configured and split programmatically among venue hosts, validators, and creators.

### 2. Onchain OS Agentic Skills
To elevate user and agent experience, MatchStake embeds the **Onchain OS Developer Kit** (`web3.okx.com/onchainos`):
* **Natural Language Trade Engine (NLP):** Converts natural language messages from the Watch Party Chat (e.g. *"Swap 10 USDT to OKB and stake draw"*) into formatted JSON execution payloads containing asset classes, gas vouchers, and signature intents.
* **Plug-and-Play Skills:** Implements pre-built capabilities (such as `okx/onchainos-dex-aggregator` and `okx/onchainos-x402-zero-gas`) to handle cross-token staking liquidity routes and gas-less user signatures.
* **Live Telemetry & Hype NFTs:** The agent tracks real-time goal metrics and surges in chat velocity, triggering dynamic SVG NFT morph updates natively on the X Layer.

### 3. Fan Liquidity Hook (FanLiquidityHook.sol)
An advanced EVM-based custom hook concept deployable to the X Layer network to link decentralized liquidity directly to real-world match outcomes:
* **AI-Powered Dynamic Fee System:** The AI co-pilot's match confidence/upset-risk signal adjusts dynamic fee credits via `updateMatchSignal()` to dynamically balance pools.
* **Outcome Liquidity Routing:** Routes stakes/liquidity intent into HOME_WIN / AWAY_WIN / DRAW outcome buckets with configurable social multipliers (`socialMultiplierBps`).
* **Fan Credit Accounting:** Every swap generates fan credits proportional to volume × dynamic fee × social multiplier, tracked per-room and per-trader for reward distribution.
* **Prediction NFT State Sync:** Allows the hook to synchronize dynamic prediction NFT state via `syncPredictionNFT()` after hook-triggered events.

---

## ✨ Features

- **Widescreen Watch Party Dashboard:** Grid layout containing active prediction forms, real-time live group chat room feeds, AI agent commentary, and the zero-gas execution console.
- **Dynamic LiveHype NFTs:** Each prediction mints an animated SVG ticket that morphs in real-time (glow filters, status loops) to reflect the live match event (Kickoff ➔ Goal ➔ Equalizer ➔ Settled).
- **Squad Arena (GameFi & SocialFi):** Form persistent squads, accumulate reputation points on-chain, and share proportional payouts across tournaments.
- **OKX DEX Swap Aggregator:** Local quotes routing USDT/USDC/ETH to OKB on X Layer, ensuring continuous liquidity for prediction stakes.
- **Viral Share Cards:** Public challenge pages with team matchup cards, predicted scores, and one-click X/Twitter sharing for social acquisition loops.
- **Submission Proof Room:** Judges-facing page mapping every hackathon requirement to a shipped feature, with deployed contract addresses and explorer links.

---

## 📦 Local Development

The project includes unified execution scripts to run both EVM hardhat deployments and offline simulation modes concurrently.

### 1. Requirements
* Node.js (v18+)
* Browser with the **OKX Wallet** extension installed.
* Testnet OKB tokens (available from X Layer Docs Faucets).

### 2. Configuration & Deployment
Create your environment credentials for contracts:
```bash
# Clone the repository
git clone https://github.com/lowkey/matchstake.git
cd matchstake

# Set your private key inside contracts/.env
cp contracts/.env.example contracts/.env
nano contracts/.env
```

To automatically compile, deploy the EVM smart contracts to X Layer Testnet, seed match telemetry, and launch both frontend and backend dev servers, run:
```bash
bash demo.sh
```

### 3. Fast Simulation Mode (No Private Keys Required)
To run the full stack immediately in mock/simulation mode (perfect for offline presentations or immediate local testing):
```bash
bash start-local.sh
```

Once the dev server is active, open the **Auto-Tour Guide** by appending `?demo=true` to the URL:
```text
http://localhost:3000/?demo=true
```
This launches a 1-to-2 minute guided tour scrolling through all core landing pages, the Exchange OS Admin Panel, room staking slips, and live NFT collection vaults.

---

## 🏆 OKX X Cup Submission Details
* **Primary Track:** AI Agent Track / DeFi & SocialFi Track
* **Docs & Portals Utilized:**
  * **X Layer Network:** [web3.okx.com/xlayer](https://web3.okx.com/xlayer)
  * **Onchain OS SDK:** [web3.okx.com/onchainos](https://web3.okx.com/onchainos)
  * **Developer Portal:** [web3.okx.com/onchainos/dev-portal](https://web3.okx.com/onchainos/dev-portal)
* **Target Network:** X Layer Testnet (Chain ID 195)
* **Gas-Optimization:** x402 Zero-gas signature vouchers.

---

## 📄 License
This project is licensed under the MIT License.
