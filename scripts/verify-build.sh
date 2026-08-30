#!/usr/bin/env bash
set -euo pipefail

export PATH="/mnt/c/Program Files/nodejs:$PATH"
cd "$(dirname "$0")/.."

LOG="verify-output.log"
exec > >(tee "$LOG") 2>&1

echo "=== Node ==="
node -v
npm -v

echo "=== npm install ==="
npm install

echo "=== npm test ==="
npm run test

echo "=== npm build ==="
npm run build

echo "=== dist contents ==="
ls -la dist/
head -15 dist/index.html

echo "=== SUCCESS ==="
