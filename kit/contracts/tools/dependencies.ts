#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../../../tools/logging";
import { getKitProjectPath } from "../../../tools/root";

/**
 * Script to install Soldeer dependencies and patch OnChain ID contracts
 * Usage:
 *   - From kit/contracts: bun run tools/dependencies.ts
 *   - From root: turbo run dependencies --filter=contracts
 */

const log = logger;

/**
 * Find the contracts directory using intelligent root detection
 */
function findContractsDirectory(): string {
  log.debug("Finding contracts directory...");

  // If we're already in kit/contracts with foundry.toml, use current directory
  if (existsSync("foundry.toml")) {
    log.debug("Found foundry.toml in current directory");
    return process.cwd();
  }

  // Use root detection to find contracts
  try {
    const contractsPath = getKitProjectPath("contracts");

    // Verify foundry.toml exists
    if (!existsSync(join(contractsPath, "foundry.toml"))) {
      throw new Error("foundry.toml not found in contracts directory");
    }

    log.debug(`Found contracts directory: ${contractsPath}`);
    return contractsPath;
  } catch (error) {
    log.error(`Could not find contracts directory: ${error}`);
    throw new Error(
      "Could not find foundry.toml file. Run this script from kit/contracts or project root."
    );
  }
}

/**
 * Check if foundry.toml has dependencies section
 */
async function hasDependencies(projectDir: string): Promise<boolean> {
  const foundryToml = join(projectDir, "foundry.toml");

  if (!existsSync(foundryToml)) {
    return false;
  }

  const file = Bun.file(foundryToml);
  const content = await file.text();

  // Check for [dependencies] section
  return /^\s*\[dependencies\]\s*$/im.test(content);
}

/**
 * Check if forge command is available
 */
async function checkForgeInstalled(): Promise<void> {
  log.debug("Checking for Forge installation...");

  const forgePath = Bun.which("forge");
  if (!forgePath) {
    throw new Error(
      "forge command not found. Please install Foundry first: https://getfoundry.sh/"
    );
  }

  log.debug(`Forge found at: ${forgePath}`);
}

/**
 * Install Soldeer dependencies
 */
async function installSoldeerDependencies(projectDir: string): Promise<void> {
  log.info("Installing Soldeer dependencies...");

  try {
    await $`forge soldeer install`.cwd(projectDir).quiet();
    log.success("Soldeer dependencies installed");
  } catch (error) {
    log.error(`Failed to install dependencies: ${error}`);
    throw error;
  }
}

/**
 * Find OnChain ID directories in dependencies folder
 */
async function findOnChainIdDirs(projectDir: string): Promise<string[]> {
  const dependenciesDir = join(projectDir, "dependencies");

  if (!existsSync(dependenciesDir)) {
    log.debug("No dependencies directory found");
    return [];
  }

  const entries = await readdir(dependenciesDir);
  const onchainidDirs: string[] = [];

  for (const entry of entries) {
    if (entry.startsWith("@onchainid-")) {
      const fullPath = join(dependenciesDir, entry);
      const stats = await stat(fullPath);
      if (stats.isDirectory()) {
        onchainidDirs.push(fullPath);
        log.debug(`Found OnChain ID directory: ${entry}`);
      }
    }
  }

  return onchainidDirs;
}

/**
 * Find all .sol files in a directory recursively
 */
async function findSolidityFiles(directory: string): Promise<string[]> {
  const solFiles: string[] = [];
  const entries = await readdir(directory);

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      const subFiles = await findSolidityFiles(fullPath);
      solFiles.push(...subFiles);
    } else if (entry.endsWith(".sol")) {
      solFiles.push(fullPath);
    }
  }

  return solFiles;
}

/**
 * Patch OnChain ID contracts for compatibility
 */
async function patchOnChainIdContracts(projectDir: string): Promise<void> {
  const onchainidDirs = await findOnChainIdDirs(projectDir);

  if (onchainidDirs.length === 0) {
    log.info("No OnChain ID contracts found to patch");
    return;
  }

  log.info(`Found ${onchainidDirs.length} OnChain ID directories to patch`);

  let totalFilesPatched = 0;

  for (const onchainidDir of onchainidDirs) {
    const dirName = onchainidDir.split("/").pop() || "";
    log.debug(`Processing ${dirName}...`);

    const solFiles = await findSolidityFiles(onchainidDir);
    let filesPatched = 0;

    for (const solFile of solFiles) {
      let fileModified = false;
      const file = Bun.file(solFile);
      let content = await file.text();

      // Update pragma statements
      if (
        content.includes("pragma solidity") &&
        !content.includes("pragma solidity >=0.8.0 <0.9.0;")
      ) {
        content = content.replace(
          /pragma solidity [^;]*;/g,
          "pragma solidity >=0.8.0 <0.9.0;"
        );
        fileModified = true;
      }

      // Update constructor syntax (old function ContractName() to constructor())
      const fileName = solFile.split("/").pop()?.replace(".sol", "") || "";
      const oldConstructorPattern = new RegExp(`function ${fileName}\\(`, "g");
      if (oldConstructorPattern.test(content)) {
        content = content.replace(oldConstructorPattern, "constructor(");
        fileModified = true;
      }

      if (fileModified) {
        await Bun.write(solFile, content);
        filesPatched++;
        totalFilesPatched++;
        log.debug(`Patched: ${solFile}`);
      }
    }

    if (filesPatched > 0) {
      log.success(`Patched ${filesPatched} files in ${dirName}`);
    }
  }

  if (totalFilesPatched > 0) {
    log.success(`Total files patched: ${totalFilesPatched}`);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  log.info("Starting Soldeer dependency installer...");

  try {
    // Find the contracts directory
    const projectDir = findContractsDirectory();
    log.info(`Using contracts directory: ${projectDir}`);

    // Check if forge is installed
    await checkForgeInstalled();

    // Check if project has dependencies
    if (!(await hasDependencies(projectDir))) {
      log.info("No dependencies found in foundry.toml");
      return;
    }

    // Install Soldeer dependencies
    await installSoldeerDependencies(projectDir);

    // Patch OnChain ID contracts
    await patchOnChainIdContracts(projectDir);

    log.success(
      "All done installing soldeer dependencies and patching onchainid contracts!"
    );
  } catch (error) {
    log.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  await main();
}
