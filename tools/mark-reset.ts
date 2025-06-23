#!/usr/bin/env bun

/**
 * Creates a timestamp file to mark when dev:up was run after a reset.
 * This is used by the query client to determine if cache should be cleared
 * when the development environment has been freshly initialized.
 */

import { join } from "path";

const markerPath = join(import.meta.dir, "..", "kit", "dapp", ".dev-reset-marker");
const timestamp = new Date().toISOString();

await Bun.write(markerPath, timestamp);
console.log(`[dev:up] Created fresh environment marker with timestamp: ${timestamp}`);