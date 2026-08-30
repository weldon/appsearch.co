#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
LOG="$PWD/setup.log"
exec > >(tee "$LOG") 2>&1

echo "=== AppSearch WSL setup ==="
echo "Working directory: $PWD"
echo "Date: $(date)"

if ! command -v node >/dev/null 2>&1; then
  echo "=== Installing Node.js 22 ==="
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "=== Node already installed ==="
fi

echo "Node: $(node --version)"
echo "npm:  $(npm --version)"

echo "=== npm install ==="
npm install

echo "=== npm test ==="
npm run test

echo "=== npm build ==="
npm run build

echo ""
echo "=== SUCCESS ==="
echo "Run the dev server with:  npm run dev"
echo "Then open:               http://localhost:5173"
echo "Full log saved to:       $LOG"
