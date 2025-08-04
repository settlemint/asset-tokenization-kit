#!/usr/bin/env bun

/**
 * ERC165 Interface ID Calculator
 *
 * This script calculates ERC165 interface IDs for all interfaces starting with capital "I"
 * Converted from bash script to TypeScript for better maintainability and integration
 */

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { $ } from "bun";
import { basename, join, relative } from "node:path";
import { getKitProjectPath } from "../../../tools/root";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ScriptOptions {
  skipBuild: boolean;
  outputDir?: string;
  outputFile?: string;
  tempContract?: string;
}

interface InterfaceMetadata {
  name: string;
  filePath: string;
  importPath: string;
}

// =============================================================================
// CONSTANTS AND CONFIGURATION
// =============================================================================

const logger = createLogger({
  level: process.env.CLAUDECODE
    ? "error"
    : (process.env.LOG_LEVEL as LogLevel) ||
      (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) ||
      "info",
});
const DEFAULT_OUTPUT_DIR = "src/erc165/utils";
const DEFAULT_OUTPUT_FILE = "interfaceids.ts";
const DEFAULT_TEMP_CONTRACT = "temp_interface_calc.sol";

// These will be initialized in main()
let CONTRACTS_ROOT: string;
let SUBGRAPH_ROOT: string;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function showUsage(): void {
  logger.info(`
Usage: bun run interfaceid.ts [OPTIONS]

This script calculates ERC165 interface IDs for all interfaces starting with capital "I".

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging (DEBUG level)
    -q, --quiet             Enable quiet mode (ERROR level only)

    --skip-build            Skip contract compilation step
    -o, --output-dir DIR    Set output directory (default: ${DEFAULT_OUTPUT_DIR})
    --output-file FILE      Set output filename (default: ${DEFAULT_OUTPUT_FILE})
    --temp-contract FILE    Set temporary contract filename (default: ${DEFAULT_TEMP_CONTRACT})

ENVIRONMENT VARIABLES:
    LOG_LEVEL               Set logging level (debug, info, warn, error)
    SETTLEMINT_LOG_LEVEL    Alternative env var for log level
    OUTPUT_DIR              Set output directory
    OUTPUT_FILE             Set output filename

    SKIP_BUILD              Set to 'true' to skip compilation

EXAMPLES:
    bun run interfaceid.ts                    # Run with default settings
    bun run interfaceid.ts --verbose          # Run with verbose output

    bun run interfaceid.ts --skip-build       # Skip compilation step
    bun run interfaceid.ts -o src/interfaces  # Use custom output directory

PREREQUISITES:
    - Forge project with foundry.toml
    - Foundry toolchain (forge command)
    - Interface contracts in contracts/ directory starting with "I"
`);
}

function parseArguments(): ScriptOptions {
  const options: ScriptOptions = {
    skipBuild: false,
  };

  const args = Bun.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-h":
      case "--help":
        showUsage();
        process.exit(0);
      case "-v":
      case "--verbose":
        // Note: SettleMint SDK logger level is set at creation time
        logger.info("Verbose mode requested (set LOG_LEVEL=debug in env)");
        break;
      case "-q":
      case "--quiet":
        // Note: SettleMint SDK logger level is set at creation time
        // Quiet mode can be achieved by setting LOG_LEVEL=error in env
        break;
      case "--skip-build":
        options.skipBuild = true;
        break;
      case "-o":
      case "--output-dir":
        options.outputDir = args[++i];
        break;
      case "--output-file":
        options.outputFile = args[++i];
        break;
      case "--temp-contract":
        options.tempContract = args[++i];
        break;
      default:
        logger.error(`Unknown argument: ${arg}`);
        showUsage();
        process.exit(1);
    }
  }

  // Apply environment variables if not set via CLI
  if (!options.outputDir && process.env.OUTPUT_DIR) {
    options.outputDir = process.env.OUTPUT_DIR;
  }
  if (!options.outputFile && process.env.OUTPUT_FILE) {
    options.outputFile = process.env.OUTPUT_FILE;
  }
  if (!options.skipBuild && process.env.SKIP_BUILD === "true") {
    options.skipBuild = true;
  }

  return options;
}

async function cleanupTempFiles(tempContract: string): Promise<void> {
  const tempFiles = [
    join(CONTRACTS_ROOT, "contracts", tempContract),
    join(CONTRACTS_ROOT, "contracts", "temp_single_calc.sol"),
    join(CONTRACTS_ROOT, "contracts", "temp_script_output.txt"),
  ];

  const cleanupPromises = tempFiles.map(async (tempFile) => {
    let cleanupSuccess = false;
    const attempts = [];

    try {
      const file = Bun.file(tempFile);
      const exists = await file.exists();

      if (!exists) {
        logger.debug(`Temp file does not exist, skipping: ${tempFile}`);
        return;
      }

      // Method 1: Try to clear and remove with Bun and shell command
      try {
        await Bun.write(tempFile, ""); // Clear the file first
        await $`rm -f ${tempFile}`.quiet(); // Force remove
        cleanupSuccess = true;
        attempts.push("bun-write + rm -f: SUCCESS");
        logger.debug(`Cleaned up temporary file (method 1): ${tempFile}`);
      } catch (error) {
        attempts.push(`bun-write + rm -f: FAILED (${error})`);
      }

      // Method 2: Try direct file system removal if method 1 failed
      if (!cleanupSuccess) {
        try {
          await $`rm -rf ${tempFile}`.quiet(); // Force recursive remove
          cleanupSuccess = true;
          attempts.push("rm -rf: SUCCESS");
          logger.debug(`Cleaned up temporary file (method 2): ${tempFile}`);
        } catch (error) {
          attempts.push(`rm -rf: FAILED (${error})`);
        }
      }

      // Method 3: Try Node.js fs unlink if shell commands failed
      if (!cleanupSuccess) {
        try {
          const fs = await import("node:fs/promises");
          await fs.unlink(tempFile);
          cleanupSuccess = true;
          attempts.push("fs.unlink: SUCCESS");
          logger.debug(`Cleaned up temporary file (method 3): ${tempFile}`);
        } catch (error) {
          attempts.push(`fs.unlink: FAILED (${error})`);
        }
      }

      // Method 4: Try to overwrite with empty content and mark as deleted
      if (!cleanupSuccess) {
        try {
          await Bun.write(
            tempFile,
            "// DELETED - This file should be removed\n"
          );
          attempts.push("overwrite-marker: SUCCESS");
          logger.debug(
            `Marked temporary file for deletion (method 4): ${tempFile}`
          );
          cleanupSuccess = true;
        } catch (error) {
          attempts.push(`overwrite-marker: FAILED (${error})`);
        }
      }

      // Method 5: Last resort - try to move to /tmp for OS cleanup
      if (!cleanupSuccess) {
        try {
          const tmpName = `temp_cleanup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.sol`;
          const tmpPath = join("/tmp", tmpName);
          await $`mv ${tempFile} ${tmpPath}`.quiet();
          attempts.push("move-to-tmp: SUCCESS");
          logger.debug(
            `Moved temporary file to /tmp (method 5): ${tempFile} -> ${tmpPath}`
          );
          cleanupSuccess = true;
        } catch (error) {
          attempts.push(`move-to-tmp: FAILED (${error})`);
        }
      }

      if (!cleanupSuccess) {
        logger.warn(`All cleanup methods failed for: ${tempFile}`);
        logger.debug(`Cleanup attempts: ${attempts.join(", ")}`);
      } else {
        logger.debug(
          `Cleanup successful for: ${tempFile} (${attempts.filter((a) => a.includes("SUCCESS")).length}/${attempts.length} methods worked)`
        );
      }
    } catch (error) {
      logger.warn(`Unexpected error during cleanup of ${tempFile}: ${error}`);
      attempts.push(`unexpected-error: ${error}`);
    }
  });

  // Wait for all cleanup operations to complete, but don't fail if some don't work
  try {
    await Promise.allSettled(cleanupPromises);
    logger.debug("Temp file cleanup completed (all attempts finished)");
  } catch (error) {
    // This should never happen with Promise.allSettled, but just in case
    logger.warn(`Cleanup coordination error: ${error}`);
  }
}

// =============================================================================
// MAIN FUNCTIONALITY
// =============================================================================

async function findInterfaceFiles(): Promise<string[]> {
  logger.info("Searching for interface files...");

  const contractsDir = join(CONTRACTS_ROOT, "contracts");

  // Check if directory exists
  let dirExists = false;
  try {
    const glob = new Bun.Glob("*");
    const scanner = glob.scan({ cwd: contractsDir, onlyFiles: false });
    await scanner.next();
    dirExists = true;
  } catch {
    dirExists = false;
  }

  if (!dirExists) {
    throw new Error(`Contracts directory not found: ${contractsDir}`);
  }

  const interfaceFiles: string[] = [];

  // Use glob to find all interface files starting with I
  const glob = new Bun.Glob("**/I*.sol");

  for await (const file of glob.scan({ cwd: contractsDir })) {
    const basename = file.split("/").pop() || "";
    // Only include files that start with I (not files with I in the middle)
    if (basename.startsWith("I")) {
      interfaceFiles.push(join(contractsDir, file));
    }
  }

  if (interfaceFiles.length === 0) {
    throw new Error(
      `No interface files starting with 'I' found in ${contractsDir}`
    );
  }

  // Sort the files for consistent processing
  interfaceFiles.sort();

  logger.info(`Found ${interfaceFiles.length} interface files:`);
  for (const file of interfaceFiles) {
    const _relativePath = relative(CONTRACTS_ROOT, file);
    logger.info(`  - ${_relativePath}`);
  }

  return interfaceFiles;
}

async function extractInterfaceMetadata(
  interfaceFiles: string[]
): Promise<InterfaceMetadata[]> {
  logger.info("Extracting interface names and metadata...");

  const interfaces: InterfaceMetadata[] = [];
  const seenInterfaces = new Set<string>();

  for (const file of interfaceFiles) {
    const interfaceName = basename(file, ".sol");

    // Skip if not starting with I (double check)
    if (!/^I[A-Z]/.test(interfaceName)) {
      logger.warn(
        `Skipping ${interfaceName}: does not match interface naming pattern`
      );
      continue;
    }

    // Check if the file actually contains an interface declaration
    const fileHandle = Bun.file(file);
    const content = await fileHandle.text();
    const interfaceRegex = new RegExp(
      `^\\s*interface\\s+${interfaceName}(\\s+|$)`,
      "m"
    );

    if (interfaceRegex.test(content)) {
      // Check if we've already seen this interface name
      if (seenInterfaces.has(interfaceName)) {
        logger.warn(
          `  ⚠ ${interfaceName}: Duplicate interface found, skipping (already processed)`
        );
        continue;
      }

      seenInterfaces.add(interfaceName);

      // Convert file path to import path relative to contracts directory
      const relativePath = relative(join(CONTRACTS_ROOT, "contracts"), file);
      const importPath = `./${relativePath}`;

      interfaces.push({
        name: interfaceName,
        filePath: file,
        importPath,
      });

      logger.info(`  ✓ ${interfaceName}`);
    } else {
      logger.warn(`  ✗ ${interfaceName}: No interface declaration found`);
    }
  }

  if (interfaces.length === 0) {
    throw new Error("No valid interfaces found");
  }

  logger.info(`Found ${interfaces.length} valid interfaces`);
  return interfaces;
}

async function createCalculatorContract(
  interfaces: InterfaceMetadata[],
  tempContract: string
): Promise<string> {
  logger.info("Creating dynamic interface ID calculator...");

  const tempContractPath = join(CONTRACTS_ROOT, "contracts", tempContract);

  let contractContent = `// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";

// Import all discovered interfaces
`;

  // Add all interface imports
  for (const iface of interfaces) {
    contractContent += `import { ${iface.name} } from "${iface.importPath}";\n`;
  }

  contractContent += `
contract InterfaceIdCalculator is Script {
    function run() external {
        console.log("=== SMART Protocol Interface IDs ===");
        console.log("");

`;

  // Add console.log statements for each interface
  for (const iface of interfaces) {
    contractContent += `        console.log("${iface.name}: %s", vm.toString(bytes4(type(${iface.name}).interfaceId)));\n`;
  }

  contractContent += `
        console.log("");
        console.log("=== TypeScript Format ===");
        console.log("export class InterfaceIds {");
`;

  // Add TypeScript static properties for each interface
  for (const iface of interfaces) {
    contractContent += `        console.log('  static ${iface.name}: Bytes = Bytes.fromHexString("%s");', vm.toString(bytes4(type(${iface.name}).interfaceId)));\n`;
  }

  contractContent += `        console.log("}");
    }
}
`;

  await Bun.write(tempContractPath, contractContent);
  logger.info(`Dynamic interface ID calculator created: ${tempContractPath}`);

  return tempContractPath;
}

async function calculateInterfaceIds(
  tempContractPath: string
): Promise<string> {
  logger.info("Calculating interface IDs... (this can take a while)");

  try {
    const result =
      await $`forge script ${tempContractPath}:InterfaceIdCalculator`
        .cwd(CONTRACTS_ROOT)
        .quiet();

    const output = result.stdout.toString();

    if (!output) {
      throw new Error("Empty output from interface ID calculation");
    }

    // Display the interface IDs (truncated to 4 bytes)
    logger.info("");
    logger.info("Interface ID calculation results:");
    logger.info("");

    // Extract and display the results section
    const lines = output.split("\n");
    let inResultsSection = false;

    for (const line of lines) {
      if (line.includes("=== SMART Protocol Interface IDs ===")) {
        inResultsSection = true;
        continue;
      }
      if (line.includes("=== TypeScript Format ===")) {
        inResultsSection = false;
        continue;
      }
      if (inResultsSection && line.trim()) {
        // Truncate to 4 bytes (8 hex chars + 0x)
        const truncated = line.replace(
          /0x([0-9a-fA-F]{8})[0-9a-fA-F]*/g,
          "0x$1"
        );
        logger.info(truncated);
      }
    }

    return output;
  } catch (error: unknown) {
    logger.error("Forge script execution failed:");

    if (error instanceof $.ShellError) {
      // If it's a ShellError from Bun, extract detailed error information
      if (error.stderr) {
        logger.error("STDERR:", error.stderr.toString());
      }
      if (error.stdout) {
        logger.error("STDOUT:", error.stdout.toString());
      }
      if (error.exitCode) {
        logger.error("Exit code:", error.exitCode);
      }
    }

    // Log the full error object for debugging
    logger.debug("Full error object:", error);

    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to calculate interface IDs: ${message}`);
  }
}

async function createOutputFile(
  scriptOutput: string,
  outputDir: string,
  outputFile: string,
  interfaceCount: number
): Promise<void> {
  logger.info("Creating output file...");

  const outputDirPath = join(SUBGRAPH_ROOT, outputDir);
  const outputFilePath = join(outputDirPath, outputFile);

  // Create output directory if it doesn't exist
  try {
    await $`mkdir -p ${outputDirPath}`.quiet();
    logger.info(`Ensured output directory exists: ${outputDirPath}`);
  } catch (error) {
    logger.warn(`Could not create directory: ${error}`);
  }

  // Check if file exists
  const outputFileHandle = Bun.file(outputFilePath);
  if (await outputFileHandle.exists()) {
    logger.info(`Overwriting existing file: ${outputFilePath}`);
  }

  // Extract TypeScript content
  const lines = scriptOutput.split("\n");
  const tsStartIndex = lines.findIndex((line) =>
    line.includes("=== TypeScript Format ===")
  );

  if (tsStartIndex === -1) {
    throw new Error("TypeScript format section not found in script output");
  }

  // Extract and process TypeScript content
  const tsLines = lines.slice(tsStartIndex + 1);
  const tsContent = tsLines
    .join("\n")
    .replace(/^$/gm, "") // Remove empty lines at start
    .replace(/0x([0-9a-fA-F]{8})[0-9a-fA-F]*/g, "0x$1") // Truncate to 4 bytes
    .trim();

  // Create the output file with header
  const fileContent = `/**
 * ERC165 Interface IDs for SMART Protocol
 *
 * This file is auto-generated by interfaceid.ts
 * Do not edit manually - run the script to regenerate
 *
 * Generated on: ${new Date().toISOString()}
 * Found ${interfaceCount} interfaces
 */

import { Bytes } from "@graphprotocol/graph-ts";

${tsContent}
`;

  await Bun.write(outputFilePath, fileContent);
  logger.info(`Interface IDs saved to: ${outputFilePath}`);

  // Display TypeScript output for verification
  logger.debug("\n");
  logger.debug("Generated TypeScript content:");
  logger.debug(tsContent);
}

async function validateOutputFile(
  outputDir: string,
  outputFile: string
): Promise<void> {
  const outputFilePath = join(SUBGRAPH_ROOT, outputDir, outputFile);

  const file = Bun.file(outputFilePath);
  if (!(await file.exists())) {
    throw new Error(`Output file was not created: ${outputFilePath}`);
  }

  const content = await file.text();

  // Check if file contains expected content
  if (!content.includes("InterfaceIds")) {
    throw new Error("Output file does not contain expected InterfaceIds class");
  }

  // Check if file contains interface definitions
  const staticCount = (content.match(/static.*Bytes/g) || []).length;

  if (staticCount === 0) {
    throw new Error("Output file does not contain any interface definitions");
  }

  logger.info(
    `Output file validation passed (${staticCount} interface definitions found)`
  );
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

async function main() {
  const options = parseArguments();

  // Initialize paths
  CONTRACTS_ROOT = await getKitProjectPath("contracts");
  SUBGRAPH_ROOT = await getKitProjectPath("subgraph");

  // Process environment variables and options
  const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
  const outputFile = options.outputFile || DEFAULT_OUTPUT_FILE;
  const tempContract = options.tempContract || DEFAULT_TEMP_CONTRACT;

  logger.info(`Starting interface ID calculator...`);
  logger.info(`Contracts root: ${CONTRACTS_ROOT}`);
  logger.info(`Subgraph root: ${SUBGRAPH_ROOT}`);
  logger.info(`Output directory: ${outputDir}`);
  logger.info(`Output file: ${outputFile}`);

  try {
    // Setup cleanup - ensure it runs no matter what happens
    const forceCleanup = async () => {
      try {
        await cleanupTempFiles(tempContract);
      } catch (error) {
        // Even if cleanup fails, don't let it crash the process
        logger.error("Cleanup error (non-fatal):", error);
      }
    };

    process.on("exit", () => {
      // Note: exit event handlers must be synchronous, so we can't await
      // But we'll still try to trigger cleanup
      cleanupTempFiles(tempContract).catch(() => {
        // Ignore cleanup errors on exit
      });
    });

    process.on("SIGINT", async () => {
      logger.info("\nReceived SIGINT, cleaning up...");
      await forceCleanup();
      process.exit(130);
    });

    process.on("SIGTERM", async () => {
      logger.info("\nReceived SIGTERM, cleaning up...");
      await forceCleanup();
      process.exit(143);
    });

    process.on("uncaughtException", async (error) => {
      logger.error("Uncaught exception:", error);
      await forceCleanup();
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason) => {
      logger.error("Unhandled rejection:", reason);
      await forceCleanup();
      process.exit(1);
    });

    // Main workflow
    const interfaceFiles = await findInterfaceFiles();
    const interfaces = await extractInterfaceMetadata(interfaceFiles);

    const tempContractPath = await createCalculatorContract(
      interfaces,
      tempContract
    );
    const scriptOutput = await calculateInterfaceIds(tempContractPath);

    await createOutputFile(
      scriptOutput,
      outputDir,
      outputFile,
      interfaces.length
    );
    await validateOutputFile(outputDir, outputFile);

    logger.info("Interface ID calculation completed successfully!");
    logger.info("");
    logger.info("Summary:");
    logger.info(
      `  - Found and processed ${interfaces.length} interfaces starting with 'I'`
    );
    logger.info("  - Calculated ERC165 interface IDs using Foundry/Forge");
    logger.info(
      `  - Results saved to: ${join(SUBGRAPH_ROOT, outputDir, outputFile)}`
    );
    logger.info("");
    logger.info("Usage:");
    logger.info("  - Import the InterfaceIds class in your TypeScript code");
    logger.info("  - Use InterfaceIds.INTERFACE_NAME to get the interface ID");
    logger.info("  - Example: InterfaceIds.ISMART");
  } catch (error) {
    logger.error(`${error}`);

    // Force cleanup before exiting, even if it fails
    try {
      await cleanupTempFiles(tempContract);
    } catch (_cleanupError) {
      logger.warn(`Cleanup failed during error handling: ${_cleanupError}`);
    }

    process.exit(1);
  } finally {
    // Final cleanup attempt - this runs regardless of success or failure
    try {
      await cleanupTempFiles(tempContract);
    } catch (_cleanupError) {
      // Don't log this as it might be redundant, just ensure it doesn't crash
    }
  }
}

// Only run main if script is executed directly
if (import.meta.main) {
  main().catch(async (error) => {
    logger.error("Unhandled error:", error);

    // Last-ditch cleanup attempt
    try {
      const tempContract = DEFAULT_TEMP_CONTRACT;
      if (typeof CONTRACTS_ROOT !== "undefined") {
        await cleanupTempFiles(tempContract);
      }
    } catch (_cleanupError) {
      // Don't let cleanup errors prevent error reporting
      logger.error("Final cleanup attempt failed:", _cleanupError);
    }

    process.exit(1);
  });
}
