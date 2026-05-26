#!/bin/bash
# ============================================
# MatchStake — Local Simulation Startup Script
# ============================================
# Runs the full stack (Express + Vite) in offline/simulation mode
# WITHOUT requiring smart contract deployment or private keys.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
GOLD='\033[0;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
DIM='\033[0;90m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo ""
echo -e "${WHITE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${GOLD}MATCHSTAKE${WHITE} — LOCAL SIMULATION MODE         ║${NC}"
echo -e "${WHITE}║   No Smart Contract Deployment Required       ║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Cleanup background processes on exit
cleanup() {
  echo ""
  echo -e "${DIM}[CLEANUP] Stopping servers...${NC}"
  if [ -n "$VITE_PID" ]; then
    kill $VITE_PID 2>/dev/null || true
  fi
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  echo -e "${DIM}[CLEANUP] Done.${NC}"
}
trap cleanup EXIT

# 1. Install dependencies
echo -e "${CYAN}[1/3]${NC} Installing dependencies..."
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo -e "  ${DIM}Installing backend node_modules...${NC}"
  (cd "$BACKEND_DIR" && npm install --silent 2>/dev/null) || true
fi
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "  ${DIM}Installing frontend node_modules...${NC}"
  (cd "$FRONTEND_DIR" && npm install --silent 2>/dev/null) || true
fi
echo -e "  ${GREEN}✓ Dependencies ready${NC}"

# 2. Start Express Backend
echo ""
echo -e "${CYAN}[2/3]${NC} Launching Express API & WebSocket backend on port 3001..."
(cd "$BACKEND_DIR" && npm start) &
BACKEND_PID=$!

# Wait for backend health check
for i in {1..10}; do
  if curl -s -o /dev/null http://localhost:3001/api/health 2>/dev/null; then
    break
  fi
  sleep 1
done
echo -e "  ${GREEN}✓ Backend live${NC}"

# 3. Start Vite Frontend
echo ""
echo -e "${CYAN}[3/3]${NC} Launching Vite Frontend on port 3000..."
(cd "$FRONTEND_DIR" && npx vite --host 0.0.0.0 --port 3000) &
VITE_PID=$!

# Wait for frontend dev server
for i in {1..10}; do
  if curl -s -o /dev/null http://localhost:3000 2>/dev/null; then
    break
  fi
  sleep 1
done
echo -e "  ${GREEN}✓ Frontend live${NC}"

# Open browser
echo -e "  ${DIM}Opening default browser to simulation tour...${NC}"
if command -v xdg-open &> /dev/null; then
  xdg-open "http://localhost:3000/?demo=true" &> /dev/null &
elif command -v open &> /dev/null; then
  open "http://localhost:3000/?demo=true" &> /dev/null &
fi

echo ""
echo -e "${WHITE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${GREEN}✓ SIMULATION SERVER IS RUNNING!${WHITE}            ║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   ${CYAN}App:${NC}  http://localhost:3000               ${WHITE}║${NC}"
echo -e "${WHITE}║   ${GOLD}Demo:${NC} http://localhost:3000/?demo=true    ${WHITE}║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}║   Press Ctrl+C to shutdown.                  ║${NC}"
echo -e "${WHITE}║                                              ║${NC}"
echo -e "${WHITE}╚══════════════════════════════════════════════╝${NC}"
echo ""

wait $VITE_PID
