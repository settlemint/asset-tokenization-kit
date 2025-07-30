#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Number of attempts: 1 initial run + 2 retries
MAX_ATTEMPTS=3
ATTEMPT=1
EXIT_CODE=0

# Clean up function to stop the server
cleanup() {
  echo "---"
  echo "Cleaning up..."
  echo "---"
  if [ ! -z "$SERVER_PID" ]; then
    echo "Stopping dev server (PID: $SERVER_PID)..."
    kill $SERVER_PID || echo "Server was already stopped."
  fi
}

# Trap the EXIT signal to ensure cleanup runs
trap cleanup EXIT

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "============================================"
  echo "RUNNING E2E TESTS: ATTEMPT $ATTEMPT / $MAX_ATTEMPTS"
  echo "============================================"

  # For retries, stop the previous server instance
  if [ $ATTEMPT -gt 1 ] && [ ! -z "$SERVER_PID" ]; then
    echo "Stopping dev server for retry..."
    kill $SERVER_PID || true
    sleep 5 # Give port time to be released
  fi

  echo "Resetting development environment..."
  (cd ../.. && bun run dev:reset)

  echo "Starting development server..."
  (cd ../.. && nohup bun run dev > server.log 2>&1 &)
  SERVER_PID=$!
  echo "Server started with PID: $SERVER_PID"

  echo "Waiting for server to become ready..."
  # Reuse the server readiness check from the original workflow
  sleep 30
  timeout_seconds=120
  elapsed=0
  success=false
  while [ $elapsed -lt $timeout_seconds ]; do
    echo "Checking server status (${elapsed}s elapsed)..."
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "failed")

    if [ "$status" = "200" ] || [ "$status" = "307" ]; then
      echo "✅ Server is ready! Status: $status"
      success=true
      break
    fi

    echo "Server not ready yet (status: $status). Retrying in 15s..."
    sleep 15
    elapsed=$((elapsed + 15))
  done

  if [ "$success" = false ]; then
    echo "❌ ERROR: Server failed to start within $timeout_seconds seconds."
    echo "Dumping server logs:"
    cat ../../server.log
    EXIT_CODE=1
    # No point in retrying if the server can't even start
    break
  fi


  echo "Running Playwright tests..."
  # Run tests without internal retries, as this script handles it.
  if bun playwright test --config=playwright.ui.config.ts --project=ui-tests --reporter=html; then
    echo "✅ Playwright tests PASSED on attempt $ATTEMPT."
    EXIT_CODE=0
    break # Exit loop on success
  else
    echo "❌ Playwright tests FAILED on attempt $ATTEMPT."
    EXIT_CODE=1
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
      echo "All $MAX_ATTEMPTS attempts have failed."
      break
    fi
  fi

  ATTEMPT=$((ATTEMPT + 1))
done

exit $EXIT_CODE