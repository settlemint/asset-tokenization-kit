#!/usr/bin/env bun

/**
 * Artifacts Copy Tool
 *
 * This script copies generated artifacts from the contracts directory to the charts directory.
 * It handles both ABI files and genesis output files.
 */

import { Glob } from "bun";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../../../tools/logging";
import { getKitProjectPath } from "../../../tools/root";

// =============================================================================
// CONFIGURATION
// =============================================================================

interface Config {
  copyAbis: boolean;
  copyGenesis: boolean;
  showOutput: boolean;
}

const defaultConfig: Config = {
  copyAbis: true,
  copyGenesis: true,
  showOutput: false,
};

const log = logger;

// File paths
const CONTRACTS_ROOT = await getKitProjectPath("contracts");
const CHARTS_ROOT = await getKitProjectPath("charts");

// Source paths
const PORTAL_DIR = join(CONTRACTS_ROOT, "portal");
const GENESIS_OUTPUT_FILE = join(CONTRACTS_ROOT, "tools/genesis-output.json");

// Destination paths
const CHARTS_PORTAL_DIR = join(CHARTS_ROOT, "atk/charts/portal/abis");
const CHARTS_GENESIS_DIR = join(
  CHARTS_ROOT,
  "atk/charts/besu-network/charts/besu-genesis/files"
);
const CHARTS_GENESIS_FILE = join(CHARTS_GENESIS_DIR, "genesis-output.json");

// =============================================================================
// ARTIFACT COPIER
// =============================================================================

class ArtifactCopier {
  private config: Config;
  private copiedAbisCount = 0;
  private copiedGenesisCount = 0;
  private failedCount = 0;

  constructor(config: Config) {
    this.config = config;
  }

  async initializeDirectories(): Promise<void> {
    log.info("Initializing destination directories...");

    if (this.config.copyAbis) {
      await mkdir(CHARTS_PORTAL_DIR, { recursive: true });
      log.debug(`Ensured charts portal directory exists: ${CHARTS_PORTAL_DIR}`);
    }

    if (this.config.copyGenesis) {
      await mkdir(CHARTS_GENESIS_DIR, { recursive: true });
      log.debug(`Ensured charts genesis directory exists: ${CHARTS_GENESIS_DIR}`);
    }

    log.success("Destination directories initialized");
  }

  async copyAbiFiles(): Promise<void> {
    if (!this.config.copyAbis) {
      log.debug("Skipping ABI files copy (disabled)");
      return;
    }

    log.info("Copying ABI files to charts portal directory...");

    if (!existsSync(PORTAL_DIR)) {
      log.warn(`Portal directory not found: ${PORTAL_DIR}`);
      log.warn("Run 'bun run codegen-abi' first to generate ABI files");
      return;
    }

    // Use Bun's Glob API to find all JSON files in portal directory
    const glob = new Glob("*.json");
    const abiFiles: string[] = [];

    for await (const file of glob.scan(PORTAL_DIR)) {
      abiFiles.push(file);
    }

    if (abiFiles.length === 0) {
      log.warn("No ABI files found in portal directory to copy");
      return;
    }

    for (const file of abiFiles) {
      try {
        const sourcePath = join(PORTAL_DIR, file);
        const destPath = join(CHARTS_PORTAL_DIR, file);

        // Read from source and write to destination
        const sourceFile = Bun.file(sourcePath);
        const content = await sourceFile.text();
        await Bun.write(destPath, content);

        this.copiedAbisCount++;
        log.debug(`Copied ${file} to charts portal`);
      } catch (error) {
        this.failedCount++;
        log.error(`Failed to copy ${file} to charts portal: ${error}`);
      }
    }

    log.success(
      `Successfully copied ${this.copiedAbisCount} ABI files to charts portal directory`
    );
    log.info(`Charts portal directory: ${CHARTS_PORTAL_DIR}`);
  }

  async copyGenesisFile(): Promise<void> {
    if (!this.config.copyGenesis) {
      log.debug("Skipping genesis file copy (disabled)");
      return;
    }

    log.info("Copying genesis output to charts directory...");

    if (!existsSync(GENESIS_OUTPUT_FILE)) {
      log.warn(`Genesis output file not found: ${GENESIS_OUTPUT_FILE}`);
      log.warn("Run 'bun run codegen-genesis' first to generate genesis output");
      return;
    }

    try {
      // Copy the file
      const genesisContent = await readFile(GENESIS_OUTPUT_FILE, "utf8");
      await writeFile(CHARTS_GENESIS_FILE, genesisContent, "utf8");

      this.copiedGenesisCount++;
      log.success(
        `Successfully copied genesis output to: ${CHARTS_GENESIS_FILE}`
      );
    } catch (error) {
      this.failedCount++;
      log.error(`Failed to copy genesis output: ${error}`);
    }
  }

  async verifyAbiCopy(): Promise<void> {
    if (!this.config.copyAbis || this.copiedAbisCount === 0) {
      return;
    }

    log.info("Verifying ABI files copy...");

    if (!existsSync(CHARTS_PORTAL_DIR)) {
      throw new Error(
        `Charts portal directory not found: ${CHARTS_PORTAL_DIR}`
      );
    }

    // Use Bun's Glob API to find JSON files in charts portal directory
    const glob = new Glob("*.json");
    const abiFiles: string[] = [];

    for await (const file of glob.scan(CHARTS_PORTAL_DIR)) {
      abiFiles.push(file);
    }

    log.debug(`Charts portal directory contains ${abiFiles.length} ABI files`);

    // Validate a few random files
    const samplesToValidate = Math.min(3, abiFiles.length);
    for (let i = 0; i < samplesToValidate; i++) {
      const randomIndex = Math.floor(Math.random() * abiFiles.length);
      const randomFile = abiFiles[randomIndex];
      if (!randomFile) {
        continue;
      }
      const filePath = join(CHARTS_PORTAL_DIR, randomFile);

      try {
        const file = Bun.file(filePath);
        const content = await file.text();
        JSON.parse(content);
        log.debug(`Validated ${randomFile} in charts portal`);
      } catch (error) {
        throw new Error(
          `Invalid JSON in charts portal ${randomFile}: ${error}`
        );
      }
    }

    log.success(
      `Successfully verified ${abiFiles.length} ABI files in charts portal directory`
    );
  }

  async verifyGenesisCopy(): Promise<void> {
    if (!this.config.copyGenesis || this.copiedGenesisCount === 0) {
      return;
    }

    log.info("Verifying genesis file copy...");

    if (!existsSync(CHARTS_GENESIS_FILE)) {
      throw new Error(`Charts genesis file not found: ${CHARTS_GENESIS_FILE}`);
    }

    try {
      const file = Bun.file(CHARTS_GENESIS_FILE);
      const content = await file.text();
      JSON.parse(content);
      log.debug("Validated genesis file in charts directory");
    } catch (error) {
      throw new Error(`Invalid JSON in charts genesis file: ${error}`);
    }

    log.success("Successfully verified genesis file in charts directory");
  }

  async showCopiedContents(): Promise<void> {
    if (!this.config.showOutput) return;

    if (this.config.copyAbis && this.copiedAbisCount > 0) {
      log.info("Charts portal directory contents:");
      // Use Bun's Glob API to find and sort JSON files
      const glob = new Glob("*.json");
      const abiFiles: string[] = [];

      for await (const file of glob.scan(CHARTS_PORTAL_DIR)) {
        abiFiles.push(file);
      }

      abiFiles.sort();

      for (const file of abiFiles) {
        console.log(`  ${file}`);
      }
    }

    if (this.config.copyGenesis && this.copiedGenesisCount > 0) {
      log.info("Charts genesis file:");
      console.log(`  ${CHARTS_GENESIS_FILE}`);
    }
  }

  getStats(): { 
    copiedAbis: number; 
    copiedGenesis: number; 
    failed: number; 
  } {
    return {
      copiedAbis: this.copiedAbisCount,
      copiedGenesis: this.copiedGenesisCount,
      failed: this.failedCount,
    };
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

function showUsage(): void {
  console.log(`
Usage: bun run copy-artifacts.ts [OPTIONS]

This script copies generated artifacts from the contracts directory to the charts directory.
It handles both ABI files and genesis output files.

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging (DEBUG level)
    -q, --quiet             Enable quiet mode (ERROR level only)
    --abis-only             Copy only ABI files
    --genesis-only          Copy only genesis output file
    --show-output           Display copied files list

ENVIRONMENT VARIABLES:
    LOG_LEVEL               Set logging level (DEBUG, INFO, WARN, ERROR)

EXAMPLES:
    bun run copy-artifacts.ts                     # Copy all artifacts
    bun run copy-artifacts.ts --verbose           # Copy with verbose output
    bun run copy-artifacts.ts --abis-only         # Copy only ABI files
    bun run copy-artifacts.ts --genesis-only      # Copy only genesis file
    bun run copy-artifacts.ts --show-output       # Show copied files list

PREREQUISITES:
    - Generated ABI files in contracts/portal directory (run 'bun run codegen-abi')
    - Generated genesis output in contracts/tools/genesis-output.json (run 'bun run codegen-genesis')
`);
}

function parseCliArgs(): Config {
  const config = { ...defaultConfig };

  // Parse environment variables
  if (process.env.LOG_LEVEL) {
    const level = process.env.LOG_LEVEL.toUpperCase();
    if (["DEBUG", "INFO", "WARN", "ERROR"].includes(level)) {
      log.setLevel(level as any);
    }
  }

  // Parse command line arguments
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-h":
      case "--help":
        showUsage();
        process.exit(0);

      case "-v":
      case "--verbose":
        log.setLevel("DEBUG" as any);
        break;

      case "-q":
      case "--quiet":
        log.setLevel("ERROR" as any);
        break;

      case "--abis-only":
        config.copyAbis = true;
        config.copyGenesis = false;
        break;

      case "--genesis-only":
        config.copyAbis = false;
        config.copyGenesis = true;
        break;

      case "--show-output":
        config.showOutput = true;
        break;

      default:
        console.error(`Unknown option: ${arg}`);
        showUsage();
        process.exit(1);
    }
  }

  return config;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

async function main(): Promise<void> {
  const config = parseCliArgs();

  log.info("Starting Artifacts Copy Tool...");
  log.info(`Contracts root: ${CONTRACTS_ROOT}`);
  log.info(`Charts root: ${CHARTS_ROOT}`);

  if (config.copyAbis) {
    log.info(`ABI source: ${PORTAL_DIR}`);
    log.info(`ABI destination: ${CHARTS_PORTAL_DIR}`);
  }

  if (config.copyGenesis) {
    log.info(`Genesis source: ${GENESIS_OUTPUT_FILE}`);
    log.info(`Genesis destination: ${CHARTS_GENESIS_FILE}`);
  }

  const copier = new ArtifactCopier(config);

  try {
    // Initialize destination directories
    await copier.initializeDirectories();

    // Copy artifacts
    await copier.copyAbiFiles();
    await copier.copyGenesisFile();

    // Verify copies
    await copier.verifyAbiCopy();
    await copier.verifyGenesisCopy();

    // Show copied contents if requested
    await copier.showCopiedContents();

    const stats = copier.getStats();
    log.success("Artifacts copy completed successfully!");
    log.info(
      `Copy summary: ${stats.copiedAbis} ABI files, ${stats.copiedGenesis} genesis file, ${stats.failed} failed`
    );

    if (config.copyAbis && stats.copiedAbis > 0) {
      log.info(`ABI files copied to: ${CHARTS_PORTAL_DIR}`);
    }

    if (config.copyGenesis && stats.copiedGenesis > 0) {
      log.info(`Genesis file copied to: ${CHARTS_GENESIS_FILE}`);
    }
  } catch (error) {
    log.error(`Artifacts copy failed: ${error}`);
    process.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
} 