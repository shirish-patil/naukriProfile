#!/bin/bash
# Wrapper that the macOS scheduler calls once a day.
# Edit PROJECT_DIR if you move the project.

PROJECT_DIR="/Users/shri/personalProjects/naukriProfile"
cd "$PROJECT_DIR" || exit 1

# Make sure Node is on PATH when launched by launchd (which has a minimal env).
export PATH="/Users/shri/.nvm/versions/node/v24.18.0/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "===== Naukri auto-update run: $TIMESTAMP =====" >> logs/run.log

# Run headless and append all output to the log.
HEADLESS=false npm run update >> logs/run.log 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "Run SUCCEEDED at $(date '+%H:%M:%S')" >> logs/run.log
else
  echo "Run FAILED (exit $EXIT_CODE) at $(date '+%H:%M:%S') — check screenshots/ and report" >> logs/run.log
fi
echo "" >> logs/run.log
exit $EXIT_CODE
