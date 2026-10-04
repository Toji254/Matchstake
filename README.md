# MatchStake — OKX X Cup Hackathon Submission

> **Portfolio snapshot:** A full-stack Web3 product combining Solidity/Uniswap v4 hooks, X Layer, wallet flows, DEX integration, prediction NFTs, group staking, and an AI Co-Pilot.
>
> **Evidence:** the repository includes an end-to-end demo walkthrough and documents the on-chain/testing surface used for the hackathon build.

> ## 🎬 Live Demo Video
> **▶️ [Watch the Full Demo Walkthrough on YouTube](https://youtu.be/6hF3FH14Pwk)**
>
> A complete end-to-end demonstration of MatchStake running on OKX X Layer Testnet — covering wallet connection, AI Co-Pilot match analysis, on-chain room creation & staking, OKX DEX swap integration, dynamic prediction NFT minting, and the Fan Liquidity Hook in action.

---

**MatchStake** is a decentralized, social watch party staking protocol for the FIFA World Cup 2026, built exclusively on the **OKX X Layer** network. Featuring a premium monochrome sci-fi editorial aesthetic, MatchStake combines real-time group chat rooms, dynamic live-updating prediction NFTs, and an on-device AI Co-Pilot, designed to integrate with OKX's upcoming **Exchange OS** and **Onchain OS** alongside a custom **Uniswap v4 Hook** architecture.

---

> [!IMPORTANT]
> ### 🏆 Hackathon Judges: Exchange OS & Onchain OS Highlight & Transparency Note
> * **Exchange OS Sandbox:** Simulates launching permissionless prediction outcome venues on X Layer using their institutional matching book specifications (asset tokens, oracle sources, and revenue sharing rules) in anticipation of its public release.
> * **Onchain OS Integration:** Fully integrated with the official **OKX Onchain OS Skills SDK** (`/home/lowkey/Desktop/onchainos-skills`). The AI Co-Pilot parses natural language staking inputs to generate exact CLI command invocations (`onchainos swap execute ...`, `onchainos portfolio ...`) and payload structures according to their modular Skill specifications, fully aligning our watch party agent with their real Defi/DEX aggregated pipelines.
> * **Custom Fan Liquidity Hook (`FanLiquidityHook.sol`):** A fully functional, deployed Solidity contract prototype that runs on X Layer Testnet, connecting our AI-dynamic fee updates, outcome pool weightings, and prediction NFT state syncs.

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
                  │   (EVM ZK-Rollup — Chain ID 1952 Testnet / 196 Mainnet) │
                  └─────────────────────────────────────────────────┘
```

---

## 🛠️ OKX OS Conceptual Sandbox Workspaces

The platform features a dedicated **OS Operations Control Center** (`/agent-ops`) designed to showcase how these capabilities function in practice as a developer sandbox:

### 1. Exchange OS Outcome Markets (Interactive Sandbox)
Demonstrates the integration flow of Exchange OS's open infrastructure to allow organizers to launch custom outcome markets for match results, goal spreads, and tournament brackets without writing low-level order books:
* **Outcome Asset Configuration:** Custom sports events (e.g., *Argentina vs France — Win Outcome*) are modeled as compiled outcome tokens.
* **Oracles & Resolution:** Conceptually mapped to **OKLink API** and Chainlink multi-sigs for zero-trust, off-chain sports telemetry resolution.
* **Matching Protocols:** Simulates Limit Order Book matching modes or social AMM liquidity models.
* **Fee Monetization:** Custom venue fees (e.g., 0.5% protocol cut) are configured and programmatically distributed.

### 2. Onchain OS Agentic Skills (Integrated SDK)
Fully integrated with the official **OKX Onchain OS Skills SDK** specifications:
* **Natural Language Command Compiler (NLP):** Converts natural language messages from the Watch Party Chat (e.g. *"Swap 10 USDT to OKB and stake draw"*) into exact, formatted CLI command invocations (`onchainos swap execute --from ... --to ... --readable-amount 10 --chain xlayer`) and JSON execution payloads.
* **Plug-and-Play Skills:** Directly maps the modular skills available in the SDK (such as `okx-wallet-portfolio`, `okx-dex-swap`, `okx-dex-market`, `okx-security`, and `okx-agent-payments-protocol`) to manage multi-chain balances, DEX aggregated routes, smart security auditing, and gas-free x402 deferred voucher execution.
* **Live Telemetry & Hype NFTs:** The agent tracks real-time goal metrics and surges in chat velocity, triggering dynamic SVG NFT morph updates natively on the X Layer.

### 3. Fan Liquidity Hook (FanLiquidityHook.sol — Deployed Contract)
A fully written, compile-safe custom contract prototype deployable to the X Layer network to link decentralized liquidity directly to real-world match outcomes:
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

## 🧩 Core Product Model: Squads vs Watch Rooms

To avoid confusion during judging/demo, MatchStake separates short-term prediction markets from long-term social identity:

- **Watch Room (match-level market):**
  - Created for a specific match (`matchId`).
  - Users join the room, submit one score/result prediction, and stake OKB.
  - Pot formation, room resolution, and claim flow happen at room level.

- **Squad (season-level social layer):**
  - Persistent group/clan identity across many matches and rooms.
  - Users join/create a squad once, then continue participating in multiple rooms.
  - Squad leaderboard reflects aggregate activity/performance over time.

- **Relationship:**
  - A user places predictions inside **Watch Rooms**.
  - The same user can simultaneously represent a **Squad**.
  - Room outcomes drive immediate payouts; cumulative behavior contributes to squad-level ranking and social competition.

### Example User Journey

1. Connect wallet on X Layer Testnet.
2. Create or join a **Squad** (optional but recommended for social competition).
3. Open a match and create/join a **Watch Room**.
4. Use AI Co-Pilot, submit prediction, and stake OKB.
5. After oracle/admin resolution, claim room payout.
6. Repeat across matches while building long-term squad leaderboard momentum.

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
git clone https://github.com/Toji254/Matchstake.git
cd Matchstake

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
* **Target Network:** X Layer Testnet (Chain ID 1952)
* **Gas-Optimization:** x402 Zero-gas signature vouchers.

### On-chain Verification Proof (Judges)

Run the proof script:

```bash
npm --prefix contracts run verify:proof:testnet
```

Expected success footer:

```text
[PASS] V4_POOLMANAGER_ADDRESS: 0x...
[PASS] V4_HOOK_ADDRESS: 0x...
[PASS] CONTRACT_ADDRESS: 0x...
[PASS] HOOK_LOW14_BITS: 0x00c0 (expected 0x00c0)
VERIFICATION_RESULT: PASS
```

Notes:
- Keep contract addresses visible in submission materials. Judges need verifiable on-chain proof.
- Never expose private keys, seed phrases, or API secrets.

---

## 📄 License
This project is licensed under the MIT License.
