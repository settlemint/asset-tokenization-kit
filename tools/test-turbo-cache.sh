#!/bin/bash

echo "Testing Turbo cache configuration..."
echo "===================================="

# Clean turbo cache
echo "1. Cleaning turbo cache..."
rm -rf .turbo node_modules/.cache/turbo

# Run initial build to populate cache
echo "2. Running initial build (should cache)..."
time bun run compile

# Run build again to test cache
echo "3. Running build again (should be cached)..."
time bun run compile

# Modify a file and run again
echo "4. Modifying a file and running again..."
touch kit/contracts/contracts/system/ATKSystemFactory.sol
time bun run compile

# Test artifacts task
echo "5. Testing artifacts task..."
time bun run artifacts

echo "===================================="
echo "Cache test complete!"