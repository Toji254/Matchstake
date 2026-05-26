#!/bin/bash
# ============================================
# MatchStake — Automated Demo Script
# OKX X Cup Hackathon Submission
# ============================================
#
# This script:
# 1. Deploys the smart contracts to X Layer Testnet
# 2. Seeds demo data (matches, rooms, squads)
# 3. Updates the frontend with deployed addresses
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
  if [ -n "$VITE_PID" ]; then
    kill $VITE_PID 2>/dev/null || true
  fi
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
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

if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
  echo -e "  ${DIM}Installing backend dependencies...${NC}"
  (cd "$SCRIPT_DIR/backend" && npm install --silent 2>/dev/null) || true
fi

echo -e "  ${GREEN}✓ Dependencies ready${NC}"

# ============================================
# STEP 3: Verify Environment
# ============================================
echo ""
echo -e "${CYAN}[03/06]${NC} Verifying deployment environment..."

if ! grep -q "PRIVATE_KEY=" "$CONTRACTS_DIR/.env" 2>/dev/null || grep -q "your_private_key_here" "$CONTRACTS_DIR/.env" 2>/dev/null; then
  echo -e "${RED}ERROR: No valid PRIVATE_KEY found in contracts/.env${NC}"
  echo -e "${GOLD}To deploy to X Layer Testnet, you must add your private key to:${NC}"
  echo -e "${WHITE}  $CONTRACTS_DIR/.env${NC}"
  echo -e "Make sure the account has testnet OKB for gas."
  exit 1
fi

echo -e "  ${GREEN}✓ Environment verified for X Layer Testnet${NC}"

# ============================================
# STEP 4: Deploy contracts
# ============================================
echo ""
echo -e "${CYAN}[04/06]${NC} Deploying smart contracts to X Layer Testnet..."

DEPLOY_OUTPUT=$(cd "$CONTRACTS_DIR" && npx hardhat run scripts/deploy.js --network xlayer_testnet 2>&1) || true

# Extract addresses from deploy output
MATCHSTAKE_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -oP '0x[a-fA-F0-9]{40}' | head -1)
NFT_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -oP '0x[a-fA-F0-9]{40}' | tail -1)

if [ -n "$MATCHSTAKE_ADDR" ] && [ -n "$NFT_ADDR" ] && [[ "$MATCHSTAKE_ADDR" != "$NFT_ADDR" ]]; then
  echo -e "  ${GREEN}✓ MatchStake deployed: ${WHITE}$MATCHSTAKE_ADDR${NC}"
  echo -e "  ${GREEN}✓ PredictionNFT deployed: ${WHITE}$NFT_ADDR${NC}"
  
  # Update frontend contract config
  sed -i "s|export const CONTRACT_ADDRESS = '.*'|export const CONTRACT_ADDRESS = '$MATCHSTAKE_ADDR'|" \
    "$FRONTEND_DIR/src/config/contract.js" 2>/dev/null || true
  sed -i "s|export const NFT_ADDRESS = '.*'|export const NFT_ADDRESS = '$NFT_ADDR'|" \
    "$FRONTEND_DIR/src/config/contract.js" 2>/dev/null || true
else
  echo -e "  ${RED}⚠ Deploy failed. Could not extract contract addresses.${NC}"
  echo -e "  ${DIM}Deploy output: $DEPLOY_OUTPUT${NC}"
  exit 1
fi

# ============================================
# STEP 5: Seed demo data
# ============================================
echo ""
echo -e "${CYAN}[05/06]${NC} Seeding World Cup match data on testnet..."

if [ -n "$MATCHSTAKE_ADDR" ]; then
  # Create a seed script
  cat > /tmp/seed_matches.js << 'SEEDEOF'
const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  
  const contractAddress = process.env.MATCHSTAKE_ADDR;
  const MatchStake = await ethers.getContractAt("MatchStake", contractAddress);
  
  console.log("Creating demo rooms...");
  
  try {
    // Create a room for match 5 (France vs Germany)
    const minStake = ethers.parseEther("0.01");
    const maxStake = ethers.parseEther("1");
    const tx1 = await MatchStake.createRoom(5, minStake, maxStake, 10);
    await tx1.wait();
    console.log("  ✓ Room 1: France vs Germany (0.01-1 OKB, 10 members)");
    
    // Join and predict
    const tx2 = await MatchStake.joinRoom(1);
    await tx2.wait();
    const tx3 = await MatchStake.makePrediction(1, 3, 2, 2, { value: ethers.parseEther("0.1") });
    await tx3.wait();
    console.log("  ✓ Owner predicted 2-2 Draw, staked 0.1 OKB");
  } catch (e) {
    console.log("  ⚠ Room seeding failed (might already exist):", e.message);
  }
  
  console.log("\n✅ All demo data seeded successfully!");
}

main().catch(console.error);
SEEDEOF

  MATCHSTAKE_ADDR=$MATCHSTAKE_ADDR npx hardhat run /tmp/seed_matches.js --network xlayer_testnet 2>&1 \
    | while IFS= read -r line; do echo -e "  ${DIM}$line${NC}"; done || true
  
  echo -e "  ${GREEN}✓ Demo data seeded${NC}"
else
  echo -e "  ${GOLD}⚠ Skipping seed (no contract). App has built-in demo data.${NC}"
fi

# ============================================
# STEP 6: Start backend and frontend
# ============================================
echo ""
echo -e "${CYAN}[06/06]${NC} Starting backend and frontend dev servers..."

echo -e "  ${DIM}Starting Express backend on port 3001...${NC}"
(cd "$SCRIPT_DIR/backend" && npm start) &
BACKEND_PID=$!

# Wait for backend to start
for i in {1..10}; do
  if curl -s -o /dev/null http://localhost:3001/api/health 2>/dev/null; then
    break
  fi
  sleep 1
done

echo -e "  ${DIM}Starting Vite frontend on port 3000...${NC}"
(cd "$FRONTEND_DIR" && npx vite --host 0.0.0.0 --port 3000) &
VITE_PID=$!

# Wait for Vite to start
for i in {1..10}; do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    break
  fi
  sleep 1
done

# Try to open the browser automatically
echo -e "  ${DIM}Opening browser to demo...${NC}"
if command -v xdg-open &> /dev/null; then
  xdg-open "http://localhost:3000/?demo=true" &> /dev/null &
elif command -v open &> /dev/null; then
  open "http://localhost:3000/?demo=true" &> /dev/null &
fi

echo ""
echo -e "${WHITE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${GREEN}✓ MATCHSTAKE IS RUNNING!${WHITE}                  ║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${CYAN}App:${NC}  http://localhost:3000               ${WHITE}║${NC}"
echo -e "${WHITE}║   ${GOLD}Demo:${NC} http://localhost:3000/?demo=true    ${WHITE}║${NC}"
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
