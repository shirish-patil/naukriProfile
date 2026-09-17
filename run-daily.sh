#!/bin/bash
# Wrapper that the macOS scheduler calls once a day.
# Edit PROJECT_DIR if you move the project.

PROJECT_DIR="/Users/shri/personalProjects/naukriProfile"
cd "$PROJECT_DIR" || exit 1

# Make sure Node is on PATH when launched by launchd (which has a minimal env).
export PATH="/Users/shri/.nvm/versions/node/v24.18.0/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "===== Naukri auto-update run: $TIMESTAMP =====" >> logs/run.log

# Wait up to 60 seconds for actual HTTPS/DNS connection to naukri.com to stabilize
MAX_WAIT=60
COUNTER=0
until [ "$(curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" --max-time 5 https://www.naukri.com)" -eq 200 ] || [ $COUNTER -ge $MAX_WAIT ]; do
  sleep 4
  COUNTER=$((COUNTER+4))
done

if [ $COUNTER -ge $MAX_WAIT ]; then
  echo "No internet connection available to naukri.com after ${MAX_WAIT}s — aborting run" >> logs/run.log
  exit 1
fi

# Pause 5s to allow DNS and network interface state to settle completely
sleep 5

# Run headless and append all output to the log.
HEADLESS=false npm run update >> logs/run.log 2>&1
EXIT_CODE=$?

# If first attempt failed, retry once after a 15s pause
if [ $EXIT_CODE -ne 0 ]; then
  echo "First attempt failed (exit $EXIT_CODE). Retrying in 15 seconds..." >> logs/run.log
  sleep 15
  HEADLESS=false npm run update >> logs/run.log 2>&1
  EXIT_CODE=$?
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "Run SUCCEEDED at $(date '+%H:%M:%S')" >> logs/run.log
else
  echo "Run FAILED (exit $EXIT_CODE) at $(date '+%H:%M:%S') — check screenshots/ and report" >> logs/run.log
fi
echo "" >> logs/run.log
exit $EXIT_CODE

