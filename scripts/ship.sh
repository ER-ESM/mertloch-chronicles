#!/usr/bin/env bash
# Ausliefern nach main – bricht bei JEDEM Fehler ab (Anlass 2026-09-20/21: Befehlsketten liefen nach einem Rebase-Konflikt weiter).
# Aufruf im Worktree, Änderungen bereits committet:  bash scripts/ship.sh [zweig]   (Standard: aktueller Zweig → origin/main)
set -euo pipefail
branch="${1:-$(git rev-parse --abbrev-ref HEAD)}"
test -z "$(git status --porcelain)" || { echo "Abbruch: es gibt nicht committete Änderungen."; exit 1; }
git fetch -q origin
git rebase origin/main || { echo "Abbruch: Rebase-Konflikt. Von Hand lösen, 'git rebase --continue', dann erneut ausliefern."; exit 1; }
node scripts/source-guard.mjs
npm test 2>&1 | tee /tmp/mertloch-ship-test.log | grep -E "^ℹ (pass|fail)"
grep -q "^ℹ fail 0" /tmp/mertloch-ship-test.log || { echo "Abbruch: Tests rot."; exit 1; }
node scripts/build-site.mjs | tail -2
if [ -n "$(git status --porcelain)" ]; then git add -A; git commit -q --amend --no-edit; fi
git fetch -q origin
[ "$(git rev-parse origin/main)" = "$(git merge-base HEAD origin/main)" ] || { echo "Abbruch: main hat sich bewegt – erneut ausliefern."; exit 1; }
git push origin "$branch:main"
echo "Ausgeliefert: $(git rev-parse --short HEAD)"
