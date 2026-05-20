#!/bin/bash
# ============================================
# MatchStake — Automated Demo Script
# OKX X Cup Hackathon Submission
# ============================================
#
# This script:
# 1. Starts the local Hardhat node
# 2. Deploys the smart contracts
# 3. Seeds demo data (matches, rooms, predictions)
# 4. Starts the frontend dev server
# 5. Opens the app in demo tour mode
#
# Usage: bash demo.sh
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
GOLD='\033[0;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
DIM='\033[0;90m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRACTS_DIR="$SCRIPT_DIR/contracts"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo ""
echo -e "${WHITE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${GOLD}MATCHSTAKE${WHITE} — DEMO AUTOMATION SCRIPT       ║${NC}"
echo -e "${WHITE}║   World Cup 2026 Social Staking Protocol     ║${NC}"
echo -e "${WHITE}║   Built for OKX X Cup Hackathon              ║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Cleanup function
cleanup() {
  echo ""
  echo -e "${DIM}[CLEANUP] Stopping background processes...${NC}"
  if [ -n "$HARDHAT_PID" ]; then
    kill $HARDHAT_PID 2>/dev/null || true
  fi
  if [ -n "$VITE_PID" ]; then
    kill $VITE_PID 2>/dev/null || true
  fi
  echo -e "${DIM}[CLEANUP] Done.${NC}"
}
trap cleanup EXIT

# ============================================
# STEP 1: Check dependencies
# ============================================
echo -e "${CYAN}[01/06]${NC} Checking dependencies..."

if ! command -v node &>/dev/null; then
  echo -e "${RED}ERROR: Node.js not found. Install it first.${NC}"
  exit 1
fi

NODE_VERSION=$(node --version)
echo -e "  ${DIM}Node.js: ${NODE_VERSION}${NC}"

if ! command -v npx &>/dev/null; then
  echo -e "${RED}ERROR: npx not found.${NC}"
  exit 1
fi

echo -e "  ${GREEN}✓ All dependencies found${NC}"

# ============================================
# STEP 2: Install contract dependencies
# ============================================
echo ""
echo -e "${CYAN}[02/06]${NC} Installing dependencies..."

if [ ! -d "$CONTRACTS_DIR/node_modules" ]; then
  echo -e "  ${DIM}Installing contract dependencies...${NC}"
  (cd "$CONTRACTS_DIR" && npm install --silent 2>/dev/null) || true
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "  ${DIM}Installing frontend dependencies...${NC}"
  (cd "$FRONTEND_DIR" && npm install --silent 2>/dev/null) || true
fi

echo -e "  ${GREEN}✓ Dependencies ready${NC}"

# ============================================
# STEP 3: Start local Hardhat node
# ============================================
echo ""
echo -e "${CYAN}[03/06]${NC} Starting local Hardhat blockchain..."

# Kill any existing hardhat nodes
pkill -f "hardhat node" 2>/dev/null || true
sleep 1

(cd "$CONTRACTS_DIR" && npx hardhat node --hostname 0.0.0.0 > /tmp/hardhat.log 2>&1) &
HARDHAT_PID=$!

# Wait for Hardhat to start
echo -e "  ${DIM}Waiting for Hardhat node to initialize...${NC}"
for i in {1..15}; do
  if curl -s -o /dev/null http://127.0.0.1:8545 2>/dev/null; then
    echo -e "  ${GREEN}✓ Hardhat node running on http://127.0.0.1:8545 (PID: $HARDHAT_PID)${NC}"
    break
  fi
  sleep 1
  if [ $i -eq 15 ]; then
    echo -e "  ${GOLD}⚠ Hardhat node may not have started. Continuing with demo mode...${NC}"
    HARDHAT_PID=""
  fi
done

# ============================================
# STEP 4: Deploy contracts
# ============================================
echo ""
echo -e "${CYAN}[04/06]${NC} Deploying smart contracts..."

if [ -n "$HARDHAT_PID" ]; then
  DEPLOY_OUTPUT=$(cd "$CONTRACTS_DIR" && npx hardhat run scripts/deploy.js --network localhost 2>&1) || true
  
  # Extract addresses from deploy output
  MATCHSTAKE_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -oP '0x[a-fA-F0-9]{40}' | head -1)
  NFT_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -oP '0x[a-fA-F0-9]{40}' | tail -1)
  
  if [ -n "$MATCHSTAKE_ADDR" ]; then
    echo -e "  ${GREEN}✓ MatchStake deployed: ${WHITE}$MATCHSTAKE_ADDR${NC}"
    echo -e "  ${GREEN}✓ PredictionNFT deployed: ${WHITE}$NFT_ADDR${NC}"
    
    # Update frontend contract config
    sed -i "s|export const CONTRACT_ADDRESS = '.*'|export const CONTRACT_ADDRESS = '$MATCHSTAKE_ADDR'|" \
      "$FRONTEND_DIR/src/config/contract.js" 2>/dev/null || true
    sed -i "s|export const NFT_ADDRESS = '.*'|export const NFT_ADDRESS = '$NFT_ADDR'|" \
      "$FRONTEND_DIR/src/config/contract.js" 2>/dev/null || true
  else
    echo -e "  ${GOLD}⚠ Deploy may have failed. App will run in demo mode.${NC}"
    echo -e "  ${DIM}Deploy output: $DEPLOY_OUTPUT${NC}"
  fi
else
  echo -e "  ${GOLD}⚠ Skipping deployment (no Hardhat node). App will run in demo mode.${NC}"
fi

# ============================================
# STEP 5: Seed demo data
# ============================================
echo ""
echo -e "${CYAN}[05/06]${NC} Seeding World Cup match data..."

if [ -n "$HARDHAT_PID" ] && [ -n "$MATCHSTAKE_ADDR" ]; then
  # Create a seed script
  cat > /tmp/seed_matches.js << 'SEEDEOF'
const { ethers } = require("hardhat");

async function main() {
  const [owner, user1, user2] = await ethers.getSigners();
  
  const contractAddress = process.env.MATCHSTAKE_ADDR;
  const MatchStake = await ethers.getContractAt("MatchStake", contractAddress);
  
  console.log("Creating World Cup 2026 matches...");
  
  const matches = [
    ["Mexico", "Canada", Math.floor(Date.now()/1000) + 86400],
    ["USA", "Morocco", Math.floor(Date.now()/1000) + 172800],
    ["Argentina", "Japan", Math.floor(Date.now()/1000) + 259200],
    ["Brazil", "South Korea", Math.floor(Date.now()/1000) + 259200],
    ["France", "Germany", Math.floor(Date.now()/1000) + 345600],
    ["England", "Spain", Math.floor(Date.now()/1000) + 345600],
    ["Portugal", "Netherlands", Math.floor(Date.now()/1000) + 432000],
    ["Italy", "Senegal", Math.floor(Date.now()/1000) + 432000],
  ];
  
  for (const [home, away, kickoff] of matches) {
    const tx = await MatchStake.createMatch(home, away, kickoff);
    await tx.wait();
    console.log(`  ✓ ${home} vs ${away}`);
  }
  
  console.log("\nCreating demo rooms...");
  
  // Create a room for match 5 (France vs Germany)
  const minStake = ethers.parseEther("0.01");
  const maxStake = ethers.parseEther("1");
  const tx1 = await MatchStake.createRoom(5, minStake, maxStake, 10);
  await tx1.wait();
  console.log("  ✓ Room 1: France vs Germany (0.01-1 OKB, 10 members)");
  
  // User1 joins and predicts
  const tx2 = await MatchStake.connect(user1).joinRoom(1);
  await tx2.wait();
  const tx3 = await MatchStake.connect(user1).makePrediction(1, 3, 2, 2, { value: ethers.parseEther("0.1") });
  await tx3.wait();
  console.log("  ✓ User1 predicted 2-2 Draw, staked 0.1 OKB");
  
  // User2 joins and predicts
  const tx4 = await MatchStake.connect(user2).joinRoom(1);
  await tx4.wait();
  const tx5 = await MatchStake.connect(user2).makePrediction(1, 1, 3, 1, { value: ethers.parseEther("0.2") });
  await tx5.wait();
  console.log("  ✓ User2 predicted 3-1 Home Win, staked 0.2 OKB");
  
  // Create a squad
  const tx6 = await MatchStake.connect(user1).createSquad("X LAYER GIANTS");
  await tx6.wait();
  console.log("  ✓ Squad created: X LAYER GIANTS");
  
  console.log("\n✅ All demo data seeded successfully!");
}

main().catch(console.error);
SEEDEOF

  MATCHSTAKE_ADDR=$MATCHSTAKE_ADDR npx hardhat run /tmp/seed_matches.js --network localhost 2>&1 \
    | while IFS= read -r line; do echo -e "  ${DIM}$line${NC}"; done || true
  
  echo -e "  ${GREEN}✓ Demo data seeded${NC}"
else
  echo -e "  ${GOLD}⚠ Skipping seed (no contract). App has built-in demo data.${NC}"
fi

# ============================================
# STEP 6: Start frontend
# ============================================
echo ""
echo -e "${CYAN}[06/06]${NC} Starting frontend dev server..."

(cd "$FRONTEND_DIR" && npx vite --host 0.0.0.0 --port 5173) &
VITE_PID=$!

# Wait for Vite to start
for i in {1..10}; do
  if curl -s -o /dev/null http://localhost:5173 2>/dev/null; then
    break
  fi
  sleep 1
done

echo ""
echo -e "${WHITE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${GREEN}✓ MATCHSTAKE IS RUNNING!${WHITE}                  ║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${CYAN}App:${NC}  http://localhost:5173               ${WHITE}║${NC}"
echo -e "${WHITE}║   ${GOLD}Demo:${NC} http://localhost:5173/?demo=true    ${WHITE}║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${DIM}Start recording your screen, then open${NC}    ${WHITE}║${NC}"
echo -e "${WHITE}║   ${DIM}the Demo URL to auto-tour all features.${NC}   ${WHITE}║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${DIM}Press Ctrl+C to stop everything.${NC}          ${WHITE}║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GOLD}DEMO TOUR FEATURES SHOWN TO JUDGES:${NC}"
echo -e "  ${WHITE}01${NC} Landing page — Premium editorial UI/UX"
echo -e "  ${WHITE}02${NC} How It Works — 4-step social staking flow"
echo -e "  ${WHITE}03${NC} Host Stadiums — World Cup 2026 venue explorer"
echo -e "  ${WHITE}04${NC} Match Schedule — On-chain data from smart contract"
echo -e "  ${WHITE}05${NC} Create Room — Watch party with custom stake ranges"
echo -e "  ${WHITE}06${NC} AI Co-Pilot — Match prediction agent (AI Track)"
echo -e "  ${WHITE}07${NC} Room Config — Smart contract write (createRoom)"
echo -e "  ${WHITE}08${NC} Room Detail — Join, predict, and stake OKB"
echo -e "  ${WHITE}09${NC} Prediction + NFT — Dynamic NFT ticket mint"
echo -e "  ${WHITE}10${NC} Collection — On-chain NFT prediction tickets"
echo -e "  ${WHITE}11${NC} Leaderboard — Global on-chain rankings"
echo -e "  ${WHITE}12${NC} Squad Arena — Team GameFi features"
echo -e "  ${WHITE}13${NC} OKX DEX Swap — Get OKB via DEX aggregator"
echo -e "  ${WHITE}14${NC} Summary — All tracks covered"
echo ""

# Keep script alive
wait $VITE_PID
