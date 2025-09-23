#!/usr/bin/env node

/**
 * Fix crypto import in Nitro output for @noble/hashes compatibility
 *
 * This script targets the specific compatibility issue between older versions
 * of @noble/hashes and the Nitro bundling environment by replacing the
 * problematic import with a working polyfill.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base directory for @noble packages
const nobleDir = join(
  __dirname,
  "../.output/server/node_modules/.nitro/@noble/"
);

// Replacement strings
const oldImport = "import { crypto } from '@noble/hashes/crypto';";
const newExport =
  "export const crypto = typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined;";

console.log("🔧 Fixing crypto import in @noble/hashes...");

// Check if base noble directory exists
if (!existsSync(nobleDir)) {
  console.log(
    "ℹ️  No @noble packages found (this is expected if app hasn't been built yet)"
  );
  process.exit(0);
}

let fixedCount = 0;
let processedVersions = [];

try {
  // Find all @noble/hashes versions
  const entries = readdirSync(nobleDir, { withFileTypes: true });
  const hashesVersions = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("hashes@"))
    .map((entry) => entry.name);

  if (hashesVersions.length === 0) {
    console.log("ℹ️  No @noble/hashes versions found");
    process.exit(0);
  }

  console.log(`📦 Found @noble/hashes versions: ${hashesVersions.join(", ")}`);

  // Process each version
  for (const version of hashesVersions) {
    const utilsPath = join(nobleDir, version, "esm/utils.js");

    if (!existsSync(utilsPath)) {
      console.log(`⚠️  utils.js not found for ${version}`);
      processedVersions.push({ version, status: "not_found" });
      continue;
    }

    // Read file content
    const content = readFileSync(utilsPath, "utf8");

    // Check if the problematic import exists
    if (!content.includes(oldImport)) {
      console.log(`✅ ${version} - Import already fixed or not present`);
      processedVersions.push({ version, status: "not_needed" });
      continue;
    }

    // Create backup
    writeFileSync(`${utilsPath}.backup`, content);

    // Replace the import
    const fixedContent = content.replace(oldImport, newExport);
    writeFileSync(utilsPath, fixedContent);

    console.log(`🔧 ${version} - Fixed crypto import`);
    processedVersions.push({ version, status: "fixed" });
    fixedCount++;
  }

  // Summary
  console.log("\n📋 Summary:");
  for (const { version, status } of processedVersions) {
    const statusEmoji = {
      fixed: "🔧",
      not_needed: "✅",
      not_found: "⚠️",
    }[status];
    console.log(`  ${statusEmoji} ${version}: ${status.replace("_", " ")}`);
  }

  if (fixedCount > 0) {
    console.log(
      `\n✅ Successfully fixed crypto import in ${fixedCount} version(s)`
    );
  } else {
    console.log("\n✅ No fixes needed - all versions are compatible");
  }
} catch (error) {
  console.error("❌ Error fixing crypto import:", error.message);
  process.exit(1);
}
