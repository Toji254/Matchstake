#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRACTS_DIR="$SCRIPT_DIR/contracts"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo -e "${CYAN}Starting MatchStake on X Layer Testnet...${NC}"

cleanup() {
  echo ""
  echo -e "${CYAN}[CLEANUP] Stopping background processes...${NC}"
  if [ -n "$VITE_PID" ]; then
    kill $VITE_PID 2>/dev/null || true
  fi
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  echo -e "${CYAN}[CLEANUP] Done.${NC}"
}
trap cleanup EXIT

# Check for private key
if grep -q "your_private_key_here" "$CONTRACTS_DIR/.env"; then
  echo -e "${RED}ERROR: You must set your PRIVATE_KEY in contracts/.env before deploying to the testnet!${NC}"
  echo -e "Make sure the wallet has testnet OKB."
  exit 1
fi

echo -e "\n${CYAN}[1/3] Deploying smart contracts to X Layer Testnet...${NC}"
cd "$CONTRACTS_DIR"
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network xlayer_testnet 2>&1)
echo "$DEPLOY_OUTPUT"

MATCHSTAKE_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -i 'MatchStake deployed to:' | grep -oP '0x[a-fA-F0-9]{40}' | head -1)
NFT_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -i 'PredictionNFT deployed to:' | grep -oP '0x[a-fA-F0-9]{40}' | head -1)

if [ -z "$MATCHSTAKE_ADDR" ] || [ -z "$NFT_ADDR" ] || [[ "$MATCHSTAKE_ADDR" == "$NFT_ADDR" ]]; then
  echo -e "${RED}Deployment failed or addresses matched. See output above.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Deployed! Updating frontend config...${NC}"
sed -i "s|export const CONTRACT_ADDRESS = '.*'|export const CONTRACT_ADDRESS = '$MATCHSTAKE_ADDR'|" "$FRONTEND_DIR/src/config/contract.js"
sed -i "s|export const NFT_ADDRESS = '.*'|export const NFT_ADDRESS = '$NFT_ADDR'|" "$FRONTEND_DIR/src/config/contract.js"

echo -e "\n${CYAN}[2/3] Seeding demo matches on testnet...${NC}"
# Create a seed script inside the contracts folder for correct module resolution
cat > "$CONTRACTS_DIR/seed_testnet.js" << 'EOF'
const { ethers } = require("hardhat");
async function main() {
  const contractAddress = process.env.MATCHSTAKE_ADDR;
  const MatchStake = await ethers.getContractAt("MatchStake", contractAddress);
  console.log("Creating World Cup 2026 matches...");
  const matches = [
    ["Mexico", "Canada", Math.floor(Date.now()/1000) + 86400],
    ["USA", "Morocco", Math.floor(Date.now()/1000) + 172800],
  ];
  for (const [home, away, kickoff] of matches) {
    try {
      const tx = await MatchStake.createMatch(home, away, kickoff);
      await tx.wait();
      console.log(`  ✓ ${home} vs ${away}`);
    } catch (e) {
      console.log(`  ⚠ ${home} vs ${away} failed (might already exist):`, e.message);
    }
  }
}
main().catch(console.error);
EOF

(cd "$CONTRACTS_DIR" && MATCHSTAKE_ADDR=$MATCHSTAKE_ADDR npx hardhat run seed_testnet.js --network xlayer_testnet)
rm -f "$CONTRACTS_DIR/seed_testnet.js"

echo -e "\n${CYAN}[3/3] Starting Backend and Frontend...${NC}"

if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
  echo -e "  ${CYAN}Installing backend dependencies...${NC}"
  (cd "$SCRIPT_DIR/backend" && npm install --silent 2>/dev/null) || true
fi

echo -e "  ${CYAN}Starting Express backend on port 3001...${NC}"
(cd "$SCRIPT_DIR/backend" && npm start) &
BACKEND_PID=$!

# Wait for backend
for i in {1..10}; do
  if curl -s -o /dev/null http://localhost:3001/api/health 2>/dev/null; then
    break
  fi
  sleep 1
done

echo -e "  ${CYAN}Starting Vite frontend on port 3000...${NC}"
cd "$FRONTEND_DIR"
npx vite --host 0.0.0.0 --port 3000 &
VITE_PID=$!

# Keep script alive
wait $VITE_PID

