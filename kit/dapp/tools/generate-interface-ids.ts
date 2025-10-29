#!/usr/bin/env bun

/**
 * ERC165 Interface ID Generator for DAPP
 *
 * This script generates TypeScript constants for ERC165 interface IDs
 * to be used in the dapp for capability detection via supportsInterface
 */

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { $ } from "bun";
import { basename, join, relative } from "node:path";
import { getKitProjectPath } from "../../../tools/root";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

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

const DEFAULT_OUTPUT_FILE = "src/lib/interface-ids.ts";
const DEFAULT_TEMP_CONTRACT = "TempInterfaceCalcDapp.s.sol";

// These will be initialized in main()
let CONTRACTS_ROOT: string;
let DAPP_ROOT: string;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

async function cleanupTempFiles(tempContract: string): Promise<void> {
  const tempFiles = [
    join(CONTRACTS_ROOT, "script", tempContract),
    join(CONTRACTS_ROOT, "contracts", "temp_single_calc.sol"),
    join(CONTRACTS_ROOT, "contracts", "temp_script_output.txt"),
  ];

  for (const tempFile of tempFiles) {
    try {
      const file = Bun.file(tempFile);
      if (await file.exists()) {
        await $`rm -f ${tempFile}`.quiet();
        logger.debug(`Cleaned up temporary file: ${tempFile}`);
      }
    } catch (error) {
      logger.warn(`Failed to cleanup ${tempFile}: ${error}`);
    }
  }
}

// =============================================================================
// MAIN FUNCTIONALITY
// =============================================================================

async function findInterfaceFiles(): Promise<string[]> {
  logger.info("Searching for interface files...");

  const contractsDir = join(CONTRACTS_ROOT, "contracts");
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

  // Sort the files for consistent processing
  interfaceFiles.sort();

  logger.info(`Found ${interfaceFiles.length} interface files`);
  return interfaceFiles;
}

async function extractInterfaceMetadata(
  interfaceFiles: string[]
): Promise<InterfaceMetadata[]> {
  logger.info("Extracting interface names and metadata...");

  const interfaces: InterfaceMetadata[] = [];
  const seenInterfaces = new Set<string>();

  // Focus on SMART protocol interfaces that are likely to be used
  const relevantInterfaces = new Set([
    "IERC20",
    "IERC165",
    "IERC3643",
    "ISMARTBurnable",
    "ISMARTCustodian",
    "ISMARTRedeemable",
    "ISMARTCapped",
    "ISMARTCollateral",
    "ISMARTYield",
    "ISMARTPausable",
    "ISMARTCommonInterface",
    "ISMARTLostWallet",
    "ICompliance",
    "IIdentityRegistry",
    "IIdentity",
  ]);

  for (const file of interfaceFiles) {
    const interfaceName = basename(file, ".sol");

    // Skip if not in our relevant list
    if (!relevantInterfaces.has(interfaceName)) {
      continue;
    }

    // Skip if not starting with I
    if (!/^I[A-Z]/.test(interfaceName)) {
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
    }
  }

  logger.info(`Found ${interfaces.length} relevant interfaces`);
  return interfaces;
}

async function createCalculatorContract(
  interfaces: InterfaceMetadata[],
  tempContract: string
): Promise<string> {
  logger.info("Creating dynamic interface ID calculator script...");

  const tempContractPath = join(CONTRACTS_ROOT, "script", tempContract);

  let contractContent = `// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "forge-std/console.sol";

// Import all discovered interfaces
`;

  // Add all interface imports (adjust path for script folder)
  for (const iface of interfaces) {
    const adjustedPath = iface.importPath.replace(/^\.\//, "../contracts/");
    contractContent += `import { ${iface.name} } from "${adjustedPath}";\n`;
  }

  contractContent += `
contract InterfaceIdCalculator is Script {
    function run() external {
        console.log("=== Interface IDs for DAPP ===");
        console.log("");

`;

  // Add console.log statements for each interface
  for (const iface of interfaces) {
    contractContent += `        console.log("${iface.name}: %s", vm.toString(bytes4(type(${iface.name}).interfaceId)));\n`;
  }

  contractContent += `
        console.log("");
        console.log("=== TypeScript Format ===");
        console.log("export const INTERFACE_IDS = {");
`;

  // Add TypeScript properties for each interface
  for (const iface of interfaces) {
    contractContent += `        console.log('  ${iface.name}: "%s",', vm.toString(bytes4(type(${iface.name}).interfaceId)));\n`;
  }

  contractContent += `        console.log("} as const;");
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
  logger.info("Calculating interface IDs...");

  try {
    const result =
      await $`forge script ${tempContractPath}:InterfaceIdCalculator`
        .cwd(CONTRACTS_ROOT)
        .quiet();

    const output = result.stdout.toString();

    if (!output) {
      throw new Error("Empty output from interface ID calculation");
    }

    return output;
  } catch (error) {
    logger.error("Forge script execution failed:");
    if (error instanceof Error) {
      logger.error("Error:", error.message);
    } else {
      logger.error("Unknown error:", error);
    }
    throw new Error("Failed to calculate interface IDs", { cause: error });
  }
}

async function createOutputFile(
  scriptOutput: string,
  outputFile: string,
  interfaceCount: number
): Promise<void> {
  logger.info("Creating output file...");

  const outputFilePath = join(DAPP_ROOT, outputFile);

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
  let tsContent = "";
  let foundExport = false;

  for (const line of tsLines) {
    if (line.includes("export const INTERFACE_IDS")) {
      foundExport = true;
      tsContent += line + "\n";
    } else if (foundExport && line.includes("} as const;")) {
      tsContent += line + "\n";
      break;
    } else if (foundExport) {
      // Truncate to 4 bytes (8 hex chars + 0x)
      const truncated = line.replace(/0x([0-9a-fA-F]{8})[0-9a-fA-F]*/g, "0x$1");
      tsContent += truncated + "\n";
    }
  }

  // Create the output file with header
  const fileContent = `/**
 * ERC165 Interface IDs for Token Actions
 *
 * This file is auto-generated by generate-interface-ids.ts
 * Do not edit manually - run \`bun run generate:interface-ids\` to regenerate
 *
 * Found ${interfaceCount} interfaces
 */

// Standard interface IDs (manually added as they're from OpenZeppelin)
const STANDARD_INTERFACE_IDS = {
  IERC165: "0x01ffc9a7",
  IERC20: "0x36372b07",
} as const;

// Generated interface IDs
${tsContent.trim()}

// Merged interface IDs for easy access
export const ALL_INTERFACE_IDS = {
  ...STANDARD_INTERFACE_IDS,
  ...INTERFACE_IDS,
} as const;

// Helper type for interface IDs
export type InterfaceId = keyof typeof ALL_INTERFACE_IDS;

// Helper function to get interface ID
export function getInterfaceId(name: InterfaceId): string {
  return ALL_INTERFACE_IDS[name];
}
`;

  // Ensure directory exists
  const outputDir = join(DAPP_ROOT, "src/lib");
  await $`mkdir -p ${outputDir}`.quiet();

  await Bun.write(outputFilePath, fileContent);
  logger.info(`Interface IDs saved to: ${outputFilePath}`);

  // Run prettier on the generated file to ensure consistent formatting
  try {
    await $`bunx prettier --write ${outputFilePath}`.quiet();
    logger.info(`Formatted generated file with Prettier`);
  } catch (error) {
    logger.warn(`Failed to format with Prettier: ${error}`);
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

async function main() {
  // Initialize paths
  CONTRACTS_ROOT = await getKitProjectPath("contracts");
  DAPP_ROOT = await getKitProjectPath("dapp");

  const outputFile = DEFAULT_OUTPUT_FILE;
  const tempContract = DEFAULT_TEMP_CONTRACT;

  logger.info(`Starting interface ID generator for DAPP...`);
  logger.info(`Contracts root: ${CONTRACTS_ROOT}`);
  logger.info(`DAPP root: ${DAPP_ROOT}`);
  logger.info(`Output file: ${outputFile}`);

  try {
    // Setup cleanup
    process.on("exit", () => {
      cleanupTempFiles(tempContract).catch(() => {});
    });

    process.on("SIGINT", async () => {
      logger.info("\nReceived SIGINT, cleaning up...");
      await cleanupTempFiles(tempContract);
      process.exit(130);
    });

    // Main workflow
    const interfaceFiles = await findInterfaceFiles();
    const interfaces = await extractInterfaceMetadata(interfaceFiles);

    if (interfaces.length === 0) {
      throw new Error("No relevant interfaces found");
    }

    const tempContractPath = await createCalculatorContract(
      interfaces,
      tempContract
    );
    const scriptOutput = await calculateInterfaceIds(tempContractPath);

    await createOutputFile(scriptOutput, outputFile, interfaces.length);

    logger.info("Interface ID generation completed successfully!");
    logger.info("");
    logger.info("Summary:");
    logger.info(`  - Found and processed ${interfaces.length} interfaces`);
    logger.info(`  - Results saved to: ${join(DAPP_ROOT, outputFile)}`);
  } catch (error) {
    logger.error(`${error}`);
    await cleanupTempFiles(tempContract);
    process.exit(1);
  } finally {
    await cleanupTempFiles(tempContract);
  }
}

// Only run main if script is executed directly
if (import.meta.main) {
  main().catch(async (error) => {
    logger.error("Unhandled error:", error);
    process.exit(1);
  });
}
