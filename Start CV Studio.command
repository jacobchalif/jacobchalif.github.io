#!/bin/zsh

set -e

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

if command -v node >/dev/null 2>&1; then
  CV_NODE="$(command -v node)"
elif [[ -x "/Users/jacobchalif/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]]; then
  CV_NODE="/Users/jacobchalif/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
else
  echo "CV Studio needs Node.js, but it was not found."
  echo "Install Node.js from https://nodejs.org and try again."
  echo
  read "REPLY?Press Return to close..."
  exit 1
fi

echo "Starting CV Studio..."
"$CV_NODE" scripts/cv-studio.mjs &
CV_SERVER_PID=$!
trap 'kill "$CV_SERVER_PID" 2>/dev/null || true' EXIT INT TERM

sleep 1
open "http://127.0.0.1:4174"

echo
echo "CV Studio is open in your browser."
echo "Keep this window open while editing."
echo "Press Control-C here when you are finished."
wait "$CV_SERVER_PID"
