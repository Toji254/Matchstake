#!/bin/bash
# ============================================
# MatchStake — Recording Launcher
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
GOLD='\033[0;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

echo -e "${WHITE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${WHITE}║   ${GOLD}MATCHSTAKE${WHITE} — RECORDING LAUNCHER           ║${NC}"
echo -e "${WHITE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# 1. Start the services
echo -e "${CYAN}Step 1:${NC} Launching MatchStake local environment..."
bash start-local.sh &
SERVER_PID=$!

# Wait for server to be ready
echo -e "${CYAN}Step 2:${NC} Waiting for frontend (port 3000) to be ready..."
until curl -s http://localhost:3000 > /dev/null; do
  sleep 1
done

echo ""
echo -e "${GREEN}✓ Environment is ready!${NC}"
echo -e "${WHITE}Open your recording software (Loom, OBS) and prepare the script.${NC}"
echo -e "${WHITE}Voiceover script located at: ${GOLD}docs/VOICEOVER_SCRIPT.md${NC}"
echo ""
echo -e "${CYAN}Press ENTER to open the browser and start the Auto-Tour...${NC}"
read

# 2. Open browser to the demo tour
if command -v xdg-open &> /dev/null; then
  xdg-open "http://localhost:3000/?demo=true" &> /dev/null &
elif command -v open &> /dev/null; then
  open "http://localhost:3000/?demo=true" &> /dev/null &
fi

echo -e "${GREEN}✓ Browser opened. Start your recording now!${NC}"
echo ""
echo -e "${GOLD}Tips for a winning video:${NC}"
echo -e "  - Read the script in ${WHITE}docs/VOICEOVER_SCRIPT.md${NC}"
echo -e "  - Use 'NEXT' and 'PREV' buttons on the tour overlay to sync with your voice."
echo -e "  - Focus on the ${CYAN}AI Co-Pilot${NC} and ${CYAN}Dynamic NFTs${NC}."
echo ""
echo -e "Press Ctrl+C to stop the servers when finished."

# Keep script alive
wait $SERVER_PID
