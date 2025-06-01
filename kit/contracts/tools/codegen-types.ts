#!/usr/bin/env bun
/**
 * codegen-types.ts - Generate TypeScript typings from Hardhat contract ABIs
 *
 * This script extracts ABI definitions from Hardhat artifacts and generates
 * TypeScript constant exports for use in the deployment and testing scripts.
 *
 * Usage:
 *   bun run codegen-types.ts              # Generate all ABIs
 *   bun run codegen-types.ts --list       # List available ABI names
 *   bun run codegen-types.ts bond equity  # Generate specific ABIs
 */

import { $ } from "bun";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { logger } from "../../../tools/logging";
import { getKitProjectPath } from "../../../tools/root";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ScriptOptions {
  skipBuild: boolean;
  operationMode: "generate-all" | "generate-specific" | "list";
  specificAbis: string[];
}

interface ContractArtifact {
  contractName: string;
  abi: any[];
  bytecode: string;
  deployedBytecode: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const log = logger;
const CONTRACTS_ROOT = getKitProjectPath("contracts");
const ARTIFACTS_DIR = join(CONTRACTS_ROOT, "artifacts");
const OUTPUT_DIR = join(CONTRACTS_ROOT, "scripts/hardhat/abi");

const AVAILABLE_ABIS = {
  onboarding: [
    "system",
    "compliance",
    "identityRegistry",
    "identityRegistryStorage",
    "trustedIssuersRegistry",
    "topicSchemeRegistry",
    "identityFactory",
    "bondFactory",
    "depositFactory",
    "equityFactory",
    "fundFactory",
    "stablecoinFactory",
  ],
  tokenInfrastructure: ["accessManager", "identity", "tokenIdentity"],
  assetTokens: ["deposit", "equity", "fund", "stablecoin", "bond"],
  coreSmart: ["ismart", "ismartBurnable"],
} as const;

// =============================================================================
// SCRIPT STATE
// =============================================================================

let options: ScriptOptions = {
  skipBuild: false,
  operationMode: "generate-all",
  specificAbis: [],
};

// =============================================================================
// MAIN FUNCTIONALITY
// =============================================================================

function showUsage(): void {
  console.log(`
Usage: bun run codegen-types.ts [OPTIONS] [ABI_NAMES...]

Generate TypeScript typings from Hardhat contract ABIs.

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose output
    -q, --quiet             Suppress informational output
    -l, --list              List all available ABI names
    --skip-build            Skip contract compilation step

ARGUMENTS:
    ABI_NAMES               Specific ABI names to generate (optional)
                           If not specified, all ABIs will be generated

EXAMPLES:
    # Generate all ABI typings
    bun run codegen-types.ts

    # List available ABI names
    bun run codegen-types.ts --list

    # Generate specific ABIs only
    bun run codegen-types.ts bond equity fund

    # Generate with verbose output
    bun run codegen-types.ts --verbose

    # Skip compilation and generate from existing artifacts
    bun run codegen-types.ts --skip-build

PREREQUISITES:
    - Contracts must be compiled with Hardhat (artifacts must exist)
    - SettleMint CLI must be available

OUTPUT:
    TypeScript files will be generated in: scripts/hardhat/abi/

AVAILABLE ABI NAMES:
    Onboarding:
      ${AVAILABLE_ABIS.onboarding.join(", ")}

    Token Infrastructure:
      ${AVAILABLE_ABIS.tokenInfrastructure.join(", ")}

    Asset Tokens:
      ${AVAILABLE_ABIS.assetTokens.join(", ")}

    Core SMART:
      ${AVAILABLE_ABIS.coreSmart.join(", ")}
`);
}

function parseArguments(args: string[]): void {
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
      case "-l":
      case "--list":
        options.operationMode = "list";
        break;
      case "--skip-build":
        options.skipBuild = true;
        log.info("Skip build mode enabled");
        break;
      default:
        if (arg.startsWith("-")) {
          log.error(`Unknown option: ${arg}`);
          showUsage();
          process.exit(1);
        } else {
          // Treat as ABI name
          options.operationMode = "generate-specific";
          options.specificAbis.push(arg);
        }
        break;
    }
  }
}

async function compileContracts(): Promise<boolean> {
  if (options.skipBuild) {
    log.info("Skipping contract compilation");
    return true;
  }

  log.info("Compiling contracts with Hardhat...");

  try {
    // Set working directory for shell commands
    $.cwd(CONTRACTS_ROOT);

    const result = await $`settlemint scs hardhat build`.quiet();

    if (result.exitCode === 0) {
      log.success("Contracts compiled successfully");
      return true;
    } else {
      log.error("Failed to compile contracts");
      if (result.stderr) {
        console.error(result.stderr.toString());
      }
      return false;
    }
  } catch (error) {
    log.error(`Failed to execute compilation: ${error}`);
    return false;
  }
}

function listAbiNames(): void {
  log.info("Available ABI names:");

  console.log("\n📦 Onboarding:");
  AVAILABLE_ABIS.onboarding.forEach((name) => console.log(`  • ${name}`));

  console.log("\n🔗 Token Infrastructure:");
  AVAILABLE_ABIS.tokenInfrastructure.forEach((name) =>
    console.log(`  • ${name}`)
  );

  console.log("\n💰 Asset Tokens:");
  AVAILABLE_ABIS.assetTokens.forEach((name) => console.log(`  • ${name}`));

  console.log("\n🧠 Core SMART:");
  AVAILABLE_ABIS.coreSmart.forEach((name) => console.log(`  • ${name}`));
}

function findArtifactFile(contractName: string): string | null {
  // Common artifact paths in Hardhat
  const possiblePaths = [
    join(ARTIFACTS_DIR, `contracts/${contractName}.sol/${contractName}.json`),
    join(
      ARTIFACTS_DIR,
      `contracts/assets/${contractName}/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/assets/bond/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/assets/deposit/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/assets/equity/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/assets/fund/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/assets/stable-coin/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/system/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/system/access-manager/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/system/compliance/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/system/identity-factory/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/system/identity-registry/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/system/identity-registry-storage/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/system/token-factory/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/system/topic-scheme-registry/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/system/trusted-issuers-registry/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/extensions/${contractName}.sol/${contractName}.json`
    ),
    join(
      ARTIFACTS_DIR,
      `contracts/interface/${contractName}.sol/${contractName}.json`
    ),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      log.debug(`Found artifact for ${contractName} at: ${path}`);
      return path;
    }
  }

  log.warn(`Artifact not found for contract: ${contractName}`);
  return null;
}

function generateAbiTyping(contractName: string): boolean {
  const artifactPath = findArtifactFile(contractName);
  if (!artifactPath) {
    return false;
  }

  try {
    const artifactContent = readFileSync(artifactPath, "utf-8");
    const artifact: ContractArtifact = JSON.parse(artifactContent);

    const abiContent = `// Generated automatically by codegen-types.ts
// Do not edit this file manually

export const ${contractName}Abi = ${JSON.stringify(artifact.abi, null, 2)} as const;

export type ${contractName}Abi = typeof ${contractName}Abi;
`;

    // Ensure output directory exists
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const outputPath = join(OUTPUT_DIR, `${contractName}.ts`);
    writeFileSync(outputPath, abiContent);

    log.success(`Generated ABI typing for ${contractName}`);
    log.debug(`Output written to: ${outputPath}`);

    return true;
  } catch (error) {
    log.error(`Failed to generate ABI typing for ${contractName}: ${error}`);
    return false;
  }
}

function generateAllAbiTypings(): boolean {
  const allAbis = [
    ...AVAILABLE_ABIS.onboarding,
    ...AVAILABLE_ABIS.tokenInfrastructure,
    ...AVAILABLE_ABIS.assetTokens,
    ...AVAILABLE_ABIS.coreSmart,
  ];

  log.info(`Generating ABI typings for ${allAbis.length} contracts...`);

  let successCount = 0;
  let failureCount = 0;

  for (const contractName of allAbis) {
    if (generateAbiTyping(contractName)) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  log.info(
    `Generation complete: ${successCount} successful, ${failureCount} failed`
  );
  return failureCount === 0;
}

function generateSpecificAbiTypings(abiNames: string[]): boolean {
  const allAbis = [
    ...AVAILABLE_ABIS.onboarding,
    ...AVAILABLE_ABIS.tokenInfrastructure,
    ...AVAILABLE_ABIS.assetTokens,
    ...AVAILABLE_ABIS.coreSmart,
  ];

  // Validate ABI names
  const validAbiNames = new Set(allAbis);
  const invalidAbis = abiNames.filter(
    (name) => !validAbiNames.has(name as any)
  );
  if (invalidAbis.length > 0) {
    log.error(`Invalid ABI names: ${invalidAbis.join(", ")}`);
    log.info("Use --list to see available ABI names");
    return false;
  }

  log.info(
    `Generating ABI typings for ${abiNames.length} specific contracts...`
  );

  let successCount = 0;
  let failureCount = 0;

  for (const contractName of abiNames) {
    if (generateAbiTyping(contractName)) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  log.info(
    `Generation complete: ${successCount} successful, ${failureCount} failed`
  );
  return failureCount === 0;
}

function generateIndexFile(): void {
  const allAbis = [
    ...AVAILABLE_ABIS.onboarding,
    ...AVAILABLE_ABIS.tokenInfrastructure,
    ...AVAILABLE_ABIS.assetTokens,
    ...AVAILABLE_ABIS.coreSmart,
  ];

  const exports = allAbis
    .filter((name) => existsSync(join(OUTPUT_DIR, `${name}.ts`)))
    .map((name) => `export * from "./${name}";`)
    .join("\n");

  const indexContent = `// Generated automatically by codegen-types.ts
// Do not edit this file manually

${exports}
`;

  const indexPath = join(OUTPUT_DIR, "index.ts");
  writeFileSync(indexPath, indexContent);
  log.success("Generated index.ts file");
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main(): Promise<void> {
  log.info("Starting ABI typings generation...");
  log.debug(`Contracts root: ${CONTRACTS_ROOT}`);

  // Parse command line arguments
  parseArguments(Bun.argv.slice(2));

  let exitCode = 0;

  try {
    switch (options.operationMode) {
      case "list":
        listAbiNames();
        break;

      case "generate-all":
        // Compile contracts first
        if (!(await compileContracts())) {
          exitCode = 1;
          break;
        }

        // Generate all ABI typings
        if (!generateAllAbiTypings()) {
          exitCode = 1;
          break;
        }

        generateIndexFile();
        log.success("All ABI typings generated successfully");
        break;

      case "generate-specific":
        // Compile contracts first
        if (!(await compileContracts())) {
          exitCode = 1;
          break;
        }

        // Generate specific ABI typings
        if (!generateSpecificAbiTypings(options.specificAbis)) {
          exitCode = 1;
          break;
        }

        generateIndexFile();
        log.success("Specific ABI typings generated successfully");
        break;

      default:
        log.error(`Unknown operation mode: ${options.operationMode}`);
        exitCode = 1;
        break;
    }
  } catch (error) {
    log.error(`Unexpected error: ${error}`);
    exitCode = 1;
  }

  if (exitCode === 0) {
    log.info("ABI typings generation completed successfully");
  }

  process.exit(exitCode);
}

// Only run main if script is executed directly
if (import.meta.main) {
  await main();
}
