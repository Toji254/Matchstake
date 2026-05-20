# MatchStake — OKX X Cup Hackathon

![MatchStake Cover](https://via.placeholder.com/1200x600/000000/FFFFFF?text=MATCHSTAKE+WORLD+CUP+2026)

**MatchStake** is a decentralized, social staking protocol for the FIFA World Cup 2026, built exclusively on the **X Layer** network. Designed with a premium monochrome sci-fi editorial aesthetic, it allows users to create private watch party rooms, predict match outcomes, and stake crypto with friends, backed by an on-device AI Co-Pilot for data-driven predictions.

## 🚀 Features

- **Social Watch Parties:** Create custom rooms for specific matches, set minimum and maximum stake limits in OKB, and invite friends via secure links.
- **Dynamic NFTs:** Every prediction mints a unique, dynamic NFT ticket that updates its status and artwork automatically based on the match's resolution (Pending 🟡 → Winner 🟢 / Completed 🔴).
- **AI Prediction Co-Pilot:** An integrated, on-device AI agent analyzes historical data, H2H records, and team form to generate real-time match predictions and risk profiles.
- **Squad Arena (GameFi):** Create or join persistent squads. Share reputation, climb the global leaderboard together, and earn collective rewards across multiple matches.
- **OKX DEX Integration:** Built-in seamless swap routing via OKX DEX aggregator, ensuring users can get OKB directly on X Layer with the best possible rates.
- **Decentralized Resolution:** Smart contract automation ensures zero-trust resolution. The pot is distributed proportionally to predictors who get the exact score (8 pts) or the correct result (3 pts).

## 🛠️ Architecture & Tech Stack

- **Blockchain:** OKX X Layer (EVM-compatible ZK-Rollup)
- **Smart Contracts:** Solidity, Hardhat, Ethers.js
- **Frontend Framework:** React (Vite), React Router
- **Web3 Integration:** Wagmi, Viem, TanStack Query
- **Styling:** Custom CSS Tokens (Monochrome / Ascii / Glassmorphism)

## 📦 Local Development

### 1. Requirements
- Node.js (v18+)
- Local Hardhat network
- Browser with an X Layer compatible wallet (OKX Wallet / MetaMask)

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/matchstake.git
cd matchstake

# Run the unified demo script to start the local blockchain,
# deploy the contracts, seed match data, and launch the frontend.
bash demo.sh
```

### 3. Demo Tour Mode
To explore the entire application flow automatically (ideal for presentations or hackathon recordings), start the development server and visit:
```text
http://localhost:5173/?demo=true
```
The automated tour will guide you through the UI/UX, Smart Contract interactions, AI Co-Pilot, and Dynamic NFTs.

## 🏆 OKX X Cup Submission Tracks

1. **DeFi / SocialFi:** Primary focus on trustless social staking and transparent payouts.
2. **AI Track:** Implementation of the match-analysis Co-Pilot.
3. **GameFi / NFTs:** Squad Arena and dynamic prediction receipts.
4. **X Layer Native:** Optimized for low fees, fast confirmation times, and OKX DEX routing.

## 📄 License
This project is licensed under the MIT License.
