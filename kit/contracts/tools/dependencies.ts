#!/usr/bin/env bun

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { $ } from "bun";
import { join } from "node:path";
import { getKitProjectPath } from "../../../tools/root";

/**
 * Script to install Soldeer dependencies and patch OnChain ID contracts
 * Usage:
 *   - From kit/contracts: bun run tools/dependencies.ts
 *   - From root: turbo run dependencies --filter=contracts
 */

const logger = createLogger({
  level: process.env.CLAUDECODE
    ? "error"
    : (process.env.LOG_LEVEL as LogLevel) ||
      (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) ||
      "info",
});

/**
 * Find the contracts directory using intelligent root detection
 */
async function findContractsDirectory(): Promise<string> {
  logger.debug("Finding contracts directory...");

  // If we're already in kit/contracts with foundry.toml, use current directory
  const foundryFile = Bun.file("foundry.toml");
  if (await foundryFile.exists()) {
    logger.debug("Found foundry.toml in current directory");
    return process.cwd();
  }

  // Use root detection to find contracts
  try {
    const contractsPath = await getKitProjectPath("contracts");

    // Verify foundry.toml exists
    const foundryPath = Bun.file(join(contractsPath, "foundry.toml"));
    if (!(await foundryPath.exists())) {
      throw new Error("foundry.toml not found in contracts directory");
    }

    logger.debug(`Found contracts directory: ${contractsPath}`);
    return contractsPath;
  } catch (error) {
    logger.error(`Could not find contracts directory: ${error}`);
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

  const file = Bun.file(foundryToml);
  if (!(await file.exists())) {
    return false;
  }

  const content = await file.text();

  // Check for [dependencies] section
  return /^\s*\[dependencies\]\s*$/im.test(content);
}

/**
 * Check if forge command is available
 */
async function checkForgeInstalled(): Promise<void> {
  logger.debug("Checking for Forge installation...");

  const forgePath = Bun.which("forge");
  if (!forgePath) {
    throw new Error(
      "forge command not found. Please install Foundry first: https://getfoundry.sh/"
    );
  }

  logger.debug(`Forge found at: ${forgePath}`);
}

/**
 * Install Soldeer dependencies
 */
async function installSoldeerDependencies(projectDir: string): Promise<void> {
  logger.info("Installing Soldeer dependencies...");

  try {
    await $`forge soldeer install`.cwd(projectDir).quiet();
    logger.info("Soldeer dependencies installed");
  } catch (error) {
    try {
      await $`~/.foundry/bin/forge soldeer install`.cwd(projectDir).quiet();
      logger.info("Soldeer dependencies installed");
    } catch (error) {
      logger.error(`Failed to install dependencies: ${error}`, error);
      throw error;
    }
  }
}

/**
 * Find OnChain ID directories in dependencies folder
 */
async function findOnChainIdDirs(projectDir: string): Promise<string[]> {
  const dependenciesDir = join(projectDir, "dependencies");

  // Check if dependencies directory exists
  let dirExists = false;
  try {
    const glob = new Bun.Glob("*");
    const scanner = glob.scan({ cwd: dependenciesDir, onlyFiles: false });
    await scanner.next();
    dirExists = true;
  } catch {
    dirExists = false;
  }

  if (!dirExists) {
    logger.debug("No dependencies directory found");
    return [];
  }

  const onchainidDirs: string[] = [];

  // Use glob to find @onchainid-* directories
  const glob = new Bun.Glob("@onchainid-*");

  for await (const dir of glob.scan({
    cwd: dependenciesDir,
    onlyFiles: false,
  })) {
    const fullPath = join(dependenciesDir, dir);
    onchainidDirs.push(fullPath);
    logger.debug(`Found OnChain ID directory: ${dir}`);
  }

  return onchainidDirs;
}

/**
 * Find all .sol files in a directory recursively
 */
async function findSolidityFiles(directory: string): Promise<string[]> {
  const solFiles: string[] = [];

  // Use glob to find all .sol files recursively
  const glob = new Bun.Glob("**/*.sol");

  for await (const file of glob.scan({ cwd: directory })) {
    solFiles.push(join(directory, file));
  }

  return solFiles;
}

/**
 * Patch OnChain ID contracts for compatibility
 */
async function patchOnChainIdContracts(projectDir: string): Promise<void> {
  const onchainidDirs = await findOnChainIdDirs(projectDir);

  if (onchainidDirs.length === 0) {
    logger.info("No OnChain ID contracts found to patch");
    return;
  }

  logger.info(`Found ${onchainidDirs.length} OnChain ID directories to patch`);

  let totalFilesPatched = 0;

  for (const onchainidDir of onchainidDirs) {
    const dirName = onchainidDir.split("/").pop() || "";
    logger.debug(`Processing ${dirName}...`);

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
        logger.debug(`Patched: ${solFile}`);
      }
    }

    if (filesPatched > 0) {
      logger.info(`Patched ${filesPatched} files in ${dirName}`);
    }
  }

  if (totalFilesPatched > 0) {
    logger.info(`Total files patched: ${totalFilesPatched}`);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  logger.info("Starting Soldeer dependency installer...");

  try {
    // Find the contracts directory
    const projectDir = await findContractsDirectory();
    logger.info(`Using contracts directory: ${projectDir}`);

    // Check if forge is installed
    await checkForgeInstalled();

    // Check if project has dependencies
    if (!(await hasDependencies(projectDir))) {
      logger.info("No dependencies found in foundry.toml");
      return;
    }

    // Install Soldeer dependencies
    await installSoldeerDependencies(projectDir);

    // Patch OnChain ID contracts
    await patchOnChainIdContracts(projectDir);

    logger.info(
      "All done installing soldeer dependencies and patching onchainid contracts!"
    );
  } catch (error) {
    logger.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  await main();
}
