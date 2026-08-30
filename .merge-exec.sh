#!/bin/bash
set +e
cd /home/weldon/Projects/appsearch.co

echo "=== git config ==="
git config user.name || echo "NO user.name"
git config user.email || echo "NO user.email"

echo "=== status before ==="
git branch -vv
git status --short

echo "=== commit if needed on spa-modernize ==="
git checkout spa-modernize 2>&1 || git checkout -b spa-modernize 2>&1
rm -f commit-output.txt .exact-run.sh merge-output.txt 2>/dev/null || true
git add -A
git status --short
if ! git diff --staged --quiet; then
  git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "Add copy-to-clipboard UX, Enter-to-search, and AWS deploy tooling.

Bundle IDs copy via a clickable row with icon feedback, platform searches
re-run on Enter when selected, and deploy:aws syncs the Vite dist/ output to S3."
else
  echo "Nothing to commit"
fi

echo "=== merge to main ==="
git checkout main
git merge spa-modernize -m "Merge spa-modernize: Vite SPA modernization"

echo "=== push ==="
git push origin main
git push origin spa-modernize

echo "=== final ==="
git log -3 --oneline
git status --short
