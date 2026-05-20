#!/bin/bash
# MatchStake - Football 2026 Theme Setup
# Run this from anywhere: bash /home/lowkey/matchstake/frontend/setup_theme.sh
set -e

DESIGN_DIR="/home/lowkey/Downloads/Kimi_Agent_Football 2026 Theme Design/app"
FRONTEND_DIR="/home/lowkey/matchstake/frontend"

echo "=== Setting up Football 2026 Theme ==="

# 1. Copy design assets
echo "→ Copying images..."
mkdir -p "$FRONTEND_DIR/public/images"
cp "$DESIGN_DIR/public/images/"*.jpg "$FRONTEND_DIR/public/images/" 2>/dev/null || echo "  (no jpg images found)"

echo "→ Copying videos..."
mkdir -p "$FRONTEND_DIR/public/videos"
cp "$DESIGN_DIR/public/videos/"*.mp4 "$FRONTEND_DIR/public/videos/" 2>/dev/null || echo "  (no mp4 videos found)"

# 2. Install dependencies
echo "→ Installing npm dependencies..."
cd "$FRONTEND_DIR"
npm install 2>&1 | tail -5

echo ""
echo "=== Setup complete! ==="
echo "Run: cd $FRONTEND_DIR && npm run dev"
