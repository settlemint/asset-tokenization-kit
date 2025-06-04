#!/usr/bin/env bun

/**
 * ABI Collection Generator
 *
 * This script collects all ABI files from the ./out directory where the contract
 * source is in ./contracts, and places them in a ./portal folder at the root.
 * Also copies them to kit/charts/atk/charts/portal/abis/ for chart deployment.
 * Excludes .metadata.json files.
 */

import { $, Glob } from "bun";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { logger } from "../../../tools/logging";
import { getKitProjectPath } from "../../../tools/root";

// =============================================================================
// CONFIGURATION
// =============================================================================

interface Config {
  showOutput: boolean;
  cleanPortalDir: boolean;
}

const defaultConfig: Config = {
  showOutput: false,
  cleanPortalDir: true,
};

const log = logger;

// File paths
const CONTRACTS_ROOT = await getKitProjectPath("contracts");
const OUT_DIR = join(CONTRACTS_ROOT, "out");
const CONTRACTS_DIR = join(CONTRACTS_ROOT, "contracts");
const PORTAL_DIR = join(CONTRACTS_ROOT, "portal");

// =============================================================================
// ABI COLLECTOR
// =============================================================================

interface AbiFile {
  contractName: string;
  sourcePath: string;
  abiPath: string;
  outputPath: string;
}

class AbiCollector {
  private config: Config;
  private collectedCount = 0;
  private skippedCount = 0;
  private failedCount = 0;

  constructor(config: Config) {
    this.config = config;
  }

  async findContractFiles(): Promise<string[]> {
    log.debug("Finding contract files in contracts directory...");

    // Use Bun's Glob API to find all .sol files
    const glob = new Glob("**/*.sol");
    const contractFiles: string[] = [];

    for await (const file of glob.scan(CONTRACTS_DIR)) {
      const fullPath = join(CONTRACTS_DIR, file);
      contractFiles.push(fullPath);
    }

    log.debug(`Found ${contractFiles.length} contract files`);
    return contractFiles;
  }

  async findAbiFiles(): Promise<AbiFile[]> {
    log.debug("Finding ABI files in out directory...");
    const abiFiles: AbiFile[] = [];

    if (!existsSync(OUT_DIR)) {
      throw new Error(
        `Out directory not found: ${OUT_DIR}. Please run 'forge build' first.`
      );
    }

    const contractFiles = await this.findContractFiles();

    // Use Bun's Glob API to find all JSON files (excluding metadata)
    const glob = new Glob("**/*.json");

    for await (const file of glob.scan(OUT_DIR)) {
      const fullPath = join(OUT_DIR, file);
      const fileName = basename(file);

      // Skip metadata files and files starting with underscore
      if (fileName.endsWith(".metadata.json") || fileName.startsWith("_")) {
        continue;
      }

      const contractName = basename(fileName, ".json");
      const parentDir = basename(dirname(fullPath));

      // Look for corresponding .sol file
      const correspondingSolFile = contractFiles.find((solFile) => {
        const solBasename = basename(solFile, ".sol");
        return solBasename === parentDir || solBasename === contractName;
      });

      if (correspondingSolFile) {
        const outputPath = join(PORTAL_DIR, `${contractName}.json`);

        abiFiles.push({
          contractName,
          sourcePath: correspondingSolFile,
          abiPath: fullPath,
          outputPath,
        });
      }
    }

    log.debug(`Found ${abiFiles.length} ABI files`);
    return abiFiles;
  }

  async validateAbiFile(abiPath: string): Promise<boolean> {
    try {
      const file = Bun.file(abiPath);
      const content = await file.text();
      const parsed = JSON.parse(content);

      // Check if it has an ABI property or is an ABI array
      if (parsed.abi || Array.isArray(parsed)) {
        return true;
      }

      log.warn(`File ${abiPath} does not appear to be a valid ABI file`);
      return false;
    } catch (error) {
      log.warn(`Error validating ABI file ${abiPath}: ${error}`);
      return false;
    }
  }

  async copyAbiFile(abiFile: AbiFile): Promise<void> {
    log.debug(`Processing ${abiFile.contractName}...`);

    try {
      // Validate ABI file
      const isValid = await this.validateAbiFile(abiFile.abiPath);
      if (!isValid) {
        this.skippedCount++;
        return;
      }

      // Read ABI content using Bun's file API
      const file = Bun.file(abiFile.abiPath);
      const content = await file.text();
      const parsed = JSON.parse(content);

      // Extract just the ABI if it's wrapped in an object
      const abi = parsed.abi || parsed;

      // Write to portal directory using Bun's file API
      await Bun.write(abiFile.outputPath, JSON.stringify(abi, null, 2));

      this.collectedCount++;
      log.debug(`Successfully copied ${abiFile.contractName} ABI`);
    } catch (error) {
      this.failedCount++;
      log.error(`Failed to copy ${abiFile.contractName}: ${error}`);
    }
  }

  async initializePortalDir(): Promise<void> {
    log.info("Initializing portal directory...");

    if (this.config.cleanPortalDir && existsSync(PORTAL_DIR)) {
      log.debug("Cleaning existing portal directory...");
      await $`rm -rf ${PORTAL_DIR}`.quiet();
    }

    await mkdir(PORTAL_DIR, { recursive: true });
    log.success("Portal directory initialized");
  }

  async processAllAbis(): Promise<void> {
    log.info("Processing all ABI files...");

    const abiFiles = await this.findAbiFiles();
    const totalFiles = abiFiles.length;

    if (totalFiles === 0) {
      log.warn("No ABI files found to process");
      return;
    }

    log.info(`Processing ${totalFiles} ABI files...`);

    for (let i = 0; i < abiFiles.length; i++) {
      const abiFile = abiFiles[i];
      if (!abiFile) {
        continue;
      }
      const progressPct = Math.floor(((i + 1) * 100) / totalFiles);

      log.debug(`[${progressPct}%] Processing ${abiFile.contractName}...`);
      await this.copyAbiFile(abiFile);

      // Show progress every 10 files or at the end
      if ((i + 1) % 10 === 0 || i === abiFiles.length - 1) {
        const totalProcessed =
          this.collectedCount + this.failedCount + this.skippedCount;
        log.info(`Progress: ${totalProcessed}/${totalFiles} files processed`);
      }
    }

    if (this.collectedCount === 0) {
      throw new Error("No ABI files were collected successfully");
    }
  }

  async verifyCollection(): Promise<void> {
    log.info("Verifying ABI collection...");

    if (!existsSync(PORTAL_DIR)) {
      throw new Error(`Portal directory not found: ${PORTAL_DIR}`);
    }

    // Use Bun's Glob API to find JSON files in portal directory
    const glob = new Glob("*.json");
    const abiFiles: string[] = [];

    for await (const file of glob.scan(PORTAL_DIR)) {
      abiFiles.push(file);
    }

    log.debug(`Portal directory contains ${abiFiles.length} ABI files`);

    if (abiFiles.length !== this.collectedCount) {
      log.warn(
        `Expected ${this.collectedCount} files, but found ${abiFiles.length} in portal directory`
      );
    }

    // Validate a few random files
    const samplesToValidate = Math.min(5, abiFiles.length);
    for (let i = 0; i < samplesToValidate; i++) {
      const randomIndex = Math.floor(Math.random() * abiFiles.length);
      const randomFile = abiFiles[randomIndex];
      if (!randomFile) {
        continue;
      }
      const filePath = join(PORTAL_DIR, randomFile);

      try {
        const file = Bun.file(filePath);
        const content = await file.text();
        JSON.parse(content);
        log.debug(`Validated ${randomFile}`);
      } catch (error) {
        throw new Error(`Invalid JSON in ${randomFile}: ${error}`);
      }
    }

    log.success(
      `Successfully verified ${abiFiles.length} ABI files in portal directory`
    );
  }

  async showPortalContents(): Promise<void> {
    if (!this.config.showOutput) return;

    log.info("Portal directory contents:");
    // Use Bun's Glob API to find and sort JSON files
    const glob = new Glob("*.json");
    const abiFiles: string[] = [];

    for await (const file of glob.scan(PORTAL_DIR)) {
      abiFiles.push(file);
    }

    abiFiles.sort();

    for (const file of abiFiles) {
      console.log(`  ${file}`);
    }
  }

  getStats(): { collected: number; skipped: number; failed: number } {
    return {
      collected: this.collectedCount,
      skipped: this.skippedCount,
      failed: this.failedCount,
    };
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

function showUsage(): void {
  console.log(`
Usage: bun run codegen-abi.ts [OPTIONS]

This script collects all ABI files from ./out where the contract is in ./contracts,
and places them in a ./portal folder. Excludes .metadata.json files.

To copy the generated ABI files to the charts directory, run:
    bun run copy-artifacts --abis-only

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging (DEBUG level)
    -q, --quiet             Enable quiet mode (ERROR level only)
    --show-output           Display collected ABI files list
    --no-clean              Don't clean portal directory before collection

ENVIRONMENT VARIABLES:
    LOG_LEVEL               Set logging level (DEBUG, INFO, WARN, ERROR)

EXAMPLES:
    bun run codegen-abi.ts                    # Run with default settings
    bun run codegen-abi.ts --verbose          # Run with verbose output
    bun run codegen-abi.ts --show-output      # Show collected files list
    bun run codegen-abi.ts --no-clean         # Don't clean portal directory

PREREQUISITES:
    - Forge project with foundry.toml
    - Compiled contracts (run 'forge build' first)
    - Contract files in ./contracts directory
    - ABI files in ./out directory
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

      case "--show-output":
        config.showOutput = true;
        break;

      case "--no-clean":
        config.cleanPortalDir = false;
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

  log.info("Starting ABI Collection Generator...");
  log.info(`Contracts root: ${CONTRACTS_ROOT}`);
  log.info(`Out directory: ${OUT_DIR}`);
  log.info(`Portal directory: ${PORTAL_DIR}`);

  // Check prerequisites
  log.info("Checking prerequisites...");

  if (!existsSync(CONTRACTS_DIR)) {
    throw new Error(`Contracts directory not found: ${CONTRACTS_DIR}`);
  }

  if (!existsSync(OUT_DIR)) {
    throw new Error(
      `Out directory not found: ${OUT_DIR}. Please run 'forge build' first.`
    );
  }

  const collector = new AbiCollector(config);

  try {
    // Initialize portal directory
    await collector.initializePortalDir();

    // Process all ABI files
    await collector.processAllAbis();

    // Verify collection
    await collector.verifyCollection();

    // Show portal contents if requested
    await collector.showPortalContents();

    const stats = collector.getStats();
    log.success("ABI collection completed successfully!");
    log.info(
      `Collection summary: ${stats.collected} collected, ${stats.skipped} skipped, ${stats.failed} failed`
    );
    log.info(`ABI files written to: ${PORTAL_DIR}`);
  } catch (error) {
    log.error(`ABI collection failed: ${error}`);
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
