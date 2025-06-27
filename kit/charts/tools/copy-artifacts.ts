#!/usr/bin/env bun

/**
 * Artifacts Copy Tool
 *
 * This script copies generated artifacts from the contracts directory to the charts directory.
 * It handles both ABI files and genesis output files.
 */

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { $, Glob } from "bun";
import { existsSync } from "node:fs";
import { join } from "node:path";
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

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel || "info",
});

// File paths
const CONTRACTS_ROOT = await getKitProjectPath("contracts");
const CHARTS_ROOT = await getKitProjectPath("charts");

// Source paths
const PORTAL_DIR = join(CONTRACTS_ROOT, ".generated/portal");
const GENESIS_OUTPUT_FILE = join(CONTRACTS_ROOT, ".generated/genesis.json");

// Destination paths
const CHARTS_PORTAL_DIR = join(CHARTS_ROOT, "atk/charts/portal/abis");
const CHARTS_GENESIS_DIR = join(
  CHARTS_ROOT,
  "atk/charts/besu-network/charts/besu-genesis/files"
);
const CHARTS_GENESIS_FILE = join(CHARTS_GENESIS_DIR, "genesis-output.json");

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a directory exists using Node.js standard fs
 */
async function directoryExists(path: string): Promise<boolean> {
  return existsSync(path);
}

/**
 * Create a directory using Bun's shell command
 */
async function createDirectory(path: string): Promise<void> {
  await $`mkdir -p ${path}`.quiet();
}

// =============================================================================
// MAIN LOGIC
// =============================================================================

class ArtifactsCopier {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async initializeDirectories(): Promise<void> {
    logger.info("Initializing destination directories...");

    if (this.config.copyAbis) {
      if (!(await directoryExists(CHARTS_PORTAL_DIR))) {
        await createDirectory(CHARTS_PORTAL_DIR);
      }
      logger.debug(`Ensured charts portal directory exists: ${CHARTS_PORTAL_DIR}`);
    }

    if (this.config.copyGenesis) {
      if (!(await directoryExists(CHARTS_GENESIS_DIR))) {
        await createDirectory(CHARTS_GENESIS_DIR);
      }
      logger.debug(`Ensured charts genesis directory exists: ${CHARTS_GENESIS_DIR}`);
    }

    logger.info("Destination directories initialized");
  }

  async copyAbiFiles(): Promise<void> {
    if (!this.config.copyAbis) {
      logger.debug("Skipping ABI files copy (disabled)");
      return;
    }

    logger.info("Copying ABI files to charts portal directory...");

    if (!(await directoryExists(PORTAL_DIR))) {
      logger.warn(`Portal directory not found: ${PORTAL_DIR}`);
      logger.warn("Run 'bun run abi-output' in the contracts workspace first to generate ABI files");
      return;
    }

    const glob = new Glob("*.json");
    const abiFiles: string[] = [];

    for await (const file of glob.scan({ cwd: PORTAL_DIR })) {
      abiFiles.push(file);
    }

    if (abiFiles.length === 0) {
      logger.warn("No ABI files found in portal directory to copy");
      return;
    }

    let copiedCount = 0;
    for (const file of abiFiles) {
      try {
        const sourcePath = join(PORTAL_DIR, file);
        const destPath = join(CHARTS_PORTAL_DIR, file);

        const sourceContent = await Bun.file(sourcePath).text();
        await Bun.write(destPath, sourceContent);

        copiedCount++;
        logger.debug(`Copied: ${file}`);
      } catch (error) {
        logger.error(`Failed to copy ${file} to charts portal: ${error}`);
      }
    }

    logger.info(
      `Copied ${copiedCount} ABI files to charts portal directory`
    );
    logger.info(`Charts portal directory: ${CHARTS_PORTAL_DIR}`);
  }

  async copyGenesisOutput(): Promise<void> {
    if (!this.config.copyGenesis) {
      logger.debug("Skipping genesis output copy (disabled)");
      return;
    }

    logger.info("Copying genesis output to charts directory...");

    const genesisFile = Bun.file(GENESIS_OUTPUT_FILE);
    if (!(await genesisFile.exists())) {
      logger.warn(`Genesis output file not found: ${GENESIS_OUTPUT_FILE}`);
      logger.warn("Run 'bun run genesis' in the contracts workspace first to generate genesis output");
      return;
    }

    try {
      const sourceContent = await Bun.file(GENESIS_OUTPUT_FILE).text();
      await Bun.write(CHARTS_GENESIS_FILE, sourceContent);

      logger.info(
        `Copied genesis output to charts genesis directory`
      );
      logger.info(`Charts genesis file: ${CHARTS_GENESIS_FILE}`);
    } catch (error) {
      logger.error(`Failed to copy genesis output: ${error}`);
    }
  }

  async verifyAbiCopy(): Promise<void> {
    if (!this.config.copyAbis) {
      return;
    }

    logger.info("Verifying ABI files copy...");

    // Check if portal directory exists
    if (!(await directoryExists(CHARTS_PORTAL_DIR))) {
      throw new Error(
        `Portal directory not created: ${CHARTS_PORTAL_DIR}`
      );
    }

    // Verify files were copied
    const glob = new Glob("*.json");
    const copiedFiles: string[] = [];

    for await (const file of glob.scan({ cwd: CHARTS_PORTAL_DIR })) {
      copiedFiles.push(file);
    }

    if (copiedFiles.length === 0) {
      throw new Error(
        "No ABI files found in charts portal directory after copy"
      );
    }

    // Verify each file is readable
    for (const file of copiedFiles) {
      try {
        const filePath = join(CHARTS_PORTAL_DIR, file);
        const content = await Bun.file(filePath).text();
        const parsed = JSON.parse(content);
        if (!parsed.abi || !Array.isArray(parsed.abi)) {
          throw new Error(`Invalid ABI structure in ${file}`);
        }
      } catch (error) {
        throw new Error(`Failed to verify ${file}: ${error}`);
      }
    }

    logger.info(
      `Successfully verified ${copiedFiles.length} ABI files in charts portal directory`
    );
  }

  async verifyGenesisOutput(): Promise<void> {
    if (!this.config.copyGenesis) {
      return;
    }

    logger.info("Verifying genesis file copy...");

    const genesisFile = Bun.file(CHARTS_GENESIS_FILE);
    if (!(await genesisFile.exists())) {
      throw new Error(
        `Genesis file not found in charts: ${CHARTS_GENESIS_FILE}`
      );
    }

    try {
      const content = await Bun.file(CHARTS_GENESIS_FILE).text();
      const parsed = JSON.parse(content);
      
      // Check if it's a full genesis file format
      if (parsed.alloc && typeof parsed.alloc === "object") {
        // Full genesis format with config, alloc, etc.
        const allocKeys = Object.keys(parsed.alloc);
        if (allocKeys.length === 0) {
          throw new Error("Genesis alloc section is empty");
        }
        // Verify at least one address in alloc looks valid
        const firstAllocKey = allocKeys[0];
        if (!firstAllocKey?.startsWith("0x") || firstAllocKey.length !== 42) {
          throw new Error("Invalid genesis alloc structure - expected addresses as keys");
        }
      } else if (typeof parsed === "object" && parsed !== null) {
        // Legacy format: flat object with addresses as keys
        const keys = Object.keys(parsed);
        if (keys.length === 0) {
          throw new Error("Genesis output is empty");
        }
        // Verify at least one address looks valid
        const firstKey = keys[0];
        if (!firstKey?.startsWith("0x") || firstKey.length !== 42) {
          throw new Error("Invalid genesis output structure - expected addresses as keys");
        }
      } else {
        throw new Error("Invalid genesis output structure - expected an object");
      }
    } catch (error) {
      throw new Error(`Failed to verify genesis output: ${error}`);
    }

    logger.info("Successfully verified genesis file in charts directory");
  }

  async showOutput(): Promise<void> {
    if (!this.config.showOutput) {
      return;
    }

    if (this.config.copyAbis) {
      logger.info("Charts portal directory contents:");
      const glob = new Glob("*.json");
      for await (const file of glob.scan({ cwd: CHARTS_PORTAL_DIR })) {
        try {
          const filePath = join(CHARTS_PORTAL_DIR, file);
          const contentPreview = await Bun.file(filePath).text();
          const parsed = JSON.parse(contentPreview);
          const numMethods = parsed.abi?.length || 0;
          logger.info(
            `  - ${file} (${numMethods} ABI entries)`
          );
        } catch (error) {
          logger.warn(`  - ${file} (failed to parse)`);
        }
      }
    }

    if (this.config.copyGenesis) {
      logger.info("Charts genesis file:");
      try {
        const content = await Bun.file(CHARTS_GENESIS_FILE).text();
        const parsed = JSON.parse(content);
        
        let numAllocations = 0;
        if (parsed.alloc && typeof parsed.alloc === "object") {
          // Full genesis format
          numAllocations = Object.keys(parsed.alloc).length;
        } else if (typeof parsed === "object") {
          // Legacy format
          numAllocations = Object.keys(parsed).length;
        }
        
        logger.info(
          `  - genesis-output.json (${numAllocations} allocations)`
        );
      } catch (error) {
        logger.warn(`  - genesis-output.json (failed to parse)`);
      }
    }
  }

  async run(): Promise<void> {
    try {
      await this.initializeDirectories();
      await this.copyAbiFiles();
      await this.copyGenesisOutput();
      await this.verifyAbiCopy();
      await this.verifyGenesisOutput();
      await this.showOutput();

      logger.info("All artifacts copied successfully!");
    } catch (error) {
      logger.error(`Failed to copy artifacts: ${error}`);
      process.exit(1);
    }
  }
}

// =============================================================================
// CLI
// =============================================================================

function parseArguments(args: string[]): Config {
  const config = { ...defaultConfig };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--help":
      case "-h":
        logger.info(`
Usage: bun run copy-artifacts.ts [OPTIONS]

Copy generated artifacts from contracts to charts directory.

Options:
  --abi-only        Only copy ABI files
  --genesis-only    Only copy genesis output
  --show-output     Display copied files information
  -h, --help        Show this help message

Examples:
  # Copy all artifacts
  bun run copy-artifacts.ts

  # Copy only ABI files and show output
  bun run copy-artifacts.ts --abi-only --show-output

  # Copy only genesis output
  bun run copy-artifacts.ts --genesis-only
        `);
        process.exit(0);

      case "--abi-only":
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
        logger.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }

  return config;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

if (import.meta.main) {
  const config = parseArguments(process.argv.slice(2));
  const copier = new ArtifactsCopier(config);
  await copier.run();
}