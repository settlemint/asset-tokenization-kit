/**
 * Fix crypto import in Nitro output for @noble/hashes compatibility
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const nobleDir = join(
  import.meta.dirname,
  "../.output/server/node_modules/.nitro/@noble/"
);

const oldImport = "import { crypto } from '@noble/hashes/crypto';";
const newExport =
  "export const crypto = typeof globalThis === 'object' && 'crypto' in globalThis ? globalThis.crypto : undefined;";

console.log("🔧 Checking @noble/hashes for crypto import issues...");

if (!existsSync(nobleDir)) {
  console.log(
    "ℹ️  No @noble packages found (this is normal if app hasn't been built yet)"
  );
  process.exit(0);
}

try {
  const hashesVersions = readdirSync(nobleDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("hashes@"))
    .map((entry) => entry.name);

  if (hashesVersions.length === 0) {
    console.log("ℹ️  No @noble/hashes versions found");
    process.exit(0);
  }

  console.log(`📦 Found @noble/hashes versions: ${hashesVersions.join(", ")}`);

  let fixedCount = 0;

  for (const version of hashesVersions) {
    const utilsPath = join(nobleDir, version, "esm/utils.js");

    if (!existsSync(utilsPath)) {
      continue;
    }

    const content = readFileSync(utilsPath, "utf8");

    if (content.includes(oldImport)) {
      console.log(`🔍 Found problematic import in ${version}`);

      try {
        const fixedContent = content.replace(oldImport, newExport);
        writeFileSync(utilsPath, fixedContent);
        console.log(`✅ Fixed crypto import in ${version}`);
        fixedCount++;
      } catch (error) {
        console.error(`❌ Failed to fix ${version}:`, error);
        process.exit(1);
      }
    }
  }

  if (fixedCount === 0) {
    console.log(
      "✅ No crypto import fixes needed - all versions are compatible!"
    );
  } else {
    console.log(
      `\n🎉 Successfully fixed crypto import in ${fixedCount} version(s)!`
    );
  }
} catch (error) {
  console.error("❌ Error processing @noble/hashes:", error);
  process.exit(1);
}
