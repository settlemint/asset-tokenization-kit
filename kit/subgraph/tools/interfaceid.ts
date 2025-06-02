#!/usr/bin/env bun

/**
 * ERC165 Interface ID Calculator
 *
 * This script calculates ERC165 interface IDs for all interfaces starting with capital "I"
 * Converted from bash script to TypeScript for better maintainability and integration
 */

import { $ } from "bun";
import { basename, join, relative } from "node:path";
import { logger } from "../../../tools/logging";
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

const log = logger;
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
  console.log(`
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
    LOG_LEVEL               Set logging level (DEBUG, INFO, WARN, ERROR)
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
        log.setLevel("DEBUG" as any);
        log.info("Verbose mode enabled");
        break;
      case "-q":
      case "--quiet":
        log.setLevel("ERROR" as any);
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
        log.error(`Unknown argument: ${arg}`);
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

  for (const tempFile of tempFiles) {
    const file = Bun.file(tempFile);
    if (await file.exists()) {
      try {
        await Bun.write(tempFile, ""); // Clear the file
        await $`rm ${tempFile}`.quiet();
        log.debug(`Cleaned up temporary file: ${tempFile}`);
      } catch (error) {
        log.warn(`Failed to clean up temporary file: ${tempFile}`);
      }
    }
  }
}

// =============================================================================
// MAIN FUNCTIONALITY
// =============================================================================

async function findInterfaceFiles(): Promise<string[]> {
  log.info("Searching for interface files...");

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

  log.success(`Found ${interfaceFiles.length} interface files:`);
  for (const file of interfaceFiles) {
    const relativePath = relative(CONTRACTS_ROOT, file);
    log.info(`  - ${relativePath}`);
  }

  return interfaceFiles;
}

async function extractInterfaceMetadata(
  interfaceFiles: string[]
): Promise<InterfaceMetadata[]> {
  log.info("Extracting interface names and metadata...");

  const interfaces: InterfaceMetadata[] = [];
  const seenInterfaces = new Set<string>();

  for (const file of interfaceFiles) {
    const interfaceName = basename(file, ".sol");

    // Skip if not starting with I (double check)
    if (!/^I[A-Z]/.test(interfaceName)) {
      log.warn(
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
        const relativePath = relative(join(CONTRACTS_ROOT, "contracts"), file);
        log.warn(
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

      log.success(`  ✓ ${interfaceName}`);
    } else {
      log.warn(`  ✗ ${interfaceName}: No interface declaration found`);
    }
  }

  if (interfaces.length === 0) {
    throw new Error("No valid interfaces found");
  }

  log.success(`Found ${interfaces.length} valid interfaces`);
  return interfaces;
}

async function createCalculatorContract(
  interfaces: InterfaceMetadata[],
  tempContract: string
): Promise<string> {
  log.info("Creating dynamic interface ID calculator...");

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
  log.success(`Dynamic interface ID calculator created: ${tempContractPath}`);

  return tempContractPath;
}

async function compileContracts(skipBuild: boolean): Promise<void> {
  if (skipBuild) {
    log.info("Skipping contract compilation");
    return;
  }

  log.info("Compiling contracts...");

  try {
    await $`forge build --silent`.cwd(CONTRACTS_ROOT);
    log.success("Contracts compiled successfully");
  } catch (error) {
    throw new Error(`Contract compilation failed: ${error}`);
  }
}

async function calculateInterfaceIds(
  tempContractPath: string
): Promise<string> {
  log.info("Calculating interface IDs...");

  try {
    const contractName = basename(tempContractPath, ".sol");
    const result =
      await $`forge script ${tempContractPath}:InterfaceIdCalculator`.cwd(
        CONTRACTS_ROOT
      );

    const output = result.stdout.toString();

    if (!output) {
      throw new Error("Empty output from interface ID calculation");
    }

    // Display the interface IDs (truncated to 4 bytes)
    console.log("\n");
    log.info("Interface ID calculation results:");
    console.log("\n");

    // Extract and display the results section
    const lines = output.split("\n");
    let inResultsSection = false;
    let inTypeScriptSection = false;

    for (const line of lines) {
      if (line.includes("=== SMART Protocol Interface IDs ===")) {
        inResultsSection = true;
        continue;
      }
      if (line.includes("=== TypeScript Format ===")) {
        inResultsSection = false;
        inTypeScriptSection = true;
        continue;
      }
      if (inResultsSection && line.trim()) {
        // Truncate to 4 bytes (8 hex chars + 0x)
        const truncated = line.replace(
          /0x([0-9a-fA-F]{8})[0-9a-fA-F]*/g,
          "0x$1"
        );
        console.log(truncated);
      }
    }

    return output;
  } catch (error) {
    throw new Error(`Failed to calculate interface IDs: ${error}`);
  }
}

async function createOutputFile(
  scriptOutput: string,
  outputDir: string,
  outputFile: string,
  interfaceCount: number
): Promise<void> {
  log.info("Creating output file...");

  const outputDirPath = join(SUBGRAPH_ROOT, outputDir);
  const outputFilePath = join(outputDirPath, outputFile);

  // Create output directory if it doesn't exist
  try {
    await $`mkdir -p ${outputDirPath}`.quiet();
    log.info(`Ensured output directory exists: ${outputDirPath}`);
  } catch (error) {
    log.warn(`Could not create directory: ${error}`);
  }

  // Check if file exists
  const outputFileHandle = Bun.file(outputFilePath);
  if (await outputFileHandle.exists()) {
    log.info(`Overwriting existing file: ${outputFilePath}`);
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
  log.success(`Interface IDs saved to: ${outputFilePath}`);

  // Display TypeScript output for verification
  console.log("\n");
  log.info("Generated TypeScript content:");
  console.log(tsContent);
}

async function validateOutputFile(
  outputDir: string,
  outputFile: string,
  interfaceCount: number
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

  log.success(
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

  log.info(`Starting interface ID calculator...`);
  log.info(`Contracts root: ${CONTRACTS_ROOT}`);
  log.info(`Subgraph root: ${SUBGRAPH_ROOT}`);
  log.info(`Output directory: ${outputDir}`);
  log.info(`Output file: ${outputFile}`);

  try {
    // Setup cleanup
    process.on("exit", async () => await cleanupTempFiles(tempContract));
    process.on("SIGINT", async () => {
      await cleanupTempFiles(tempContract);
      process.exit(130);
    });

    // Main workflow
    const interfaceFiles = await findInterfaceFiles();
    const interfaces = await extractInterfaceMetadata(interfaceFiles);

    await compileContracts(options.skipBuild);

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
    await validateOutputFile(outputDir, outputFile, interfaces.length);

    log.success("Interface ID calculation completed successfully!");
    console.log("\n");
    log.info("Summary:");
    log.info(
      `  - Found and processed ${interfaces.length} interfaces starting with 'I'`
    );
    log.info("  - Calculated ERC165 interface IDs using Foundry/Forge");
    log.info(
      `  - Results saved to: ${join(SUBGRAPH_ROOT, outputDir, outputFile)}`
    );
    console.log("\n");
    log.info("Usage:");
    log.info("  - Import the InterfaceIds class in your TypeScript code");
    log.info("  - Use InterfaceIds.INTERFACE_NAME to get the interface ID");
    log.info("  - Example: InterfaceIds.ISMART");
  } catch (error) {
    log.error(`${error}`);
    cleanupTempFiles(tempContract);
    process.exit(1);
  }
}

// Only run main if script is executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}
