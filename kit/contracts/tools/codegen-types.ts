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

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { $ } from "bun";
import { existsSync } from "node:fs";
import { join } from "node:path";
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

const logger = createLogger({
  level: process.env.CLAUDECODE
    ? "error"
    : (process.env.LOG_LEVEL as LogLevel) ||
      (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) ||
      "info",
});
const CONTRACTS_ROOT = await getKitProjectPath("contracts");
const ARTIFACTS_DIR = join(CONTRACTS_ROOT, ".generated", "artifacts");
const OUTPUT_DIR = join(CONTRACTS_ROOT, "scripts/hardhat/abi");

const ABI_PATHS = {
  // onboarding
  system: `${ARTIFACTS_DIR}/contracts/system/IATKSystem.sol/IATKSystem.json`,
  compliance: `${ARTIFACTS_DIR}/contracts/system/compliance/IATKCompliance.sol/IATKCompliance.json`,
  identityRegistry: `${ARTIFACTS_DIR}/contracts/smart/interface/ISMARTIdentityRegistry.sol/ISMARTIdentityRegistry.json`,
  identityRegistryStorage: `${ARTIFACTS_DIR}/contracts/smart/interface/ERC-3643/IERC3643IdentityRegistryStorage.sol/IERC3643IdentityRegistryStorage.json`,
  trustedIssuersRegistry: `${ARTIFACTS_DIR}/contracts/smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol/IERC3643TrustedIssuersRegistry.json`,
  topicSchemeRegistry: `${ARTIFACTS_DIR}/contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol/ATKTopicSchemeRegistryImplementation.json`,
  identityFactory: `${ARTIFACTS_DIR}/contracts/system/identity-factory/IATKIdentityFactory.sol/IATKIdentityFactory.json`,
  bondFactory: `${ARTIFACTS_DIR}/contracts/assets/bond/IATKBondFactory.sol/IATKBondFactory.json`,
  depositFactory: `${ARTIFACTS_DIR}/contracts/assets/deposit/ATKDepositFactoryImplementation.sol/ATKDepositFactoryImplementation.json`,
  equityFactory: `${ARTIFACTS_DIR}/contracts/assets/equity/IATKEquityFactory.sol/IATKEquityFactory.json`,
  fundFactory: `${ARTIFACTS_DIR}/contracts/assets/fund/IATKFundFactory.sol/IATKFundFactory.json`,
  stablecoinFactory: `${ARTIFACTS_DIR}/contracts/assets/stable-coin/IATKStableCoinFactory.sol/IATKStableCoinFactory.json`,
  systemAccessManager: `${ARTIFACTS_DIR}/contracts/system/access-manager/IATKSystemAccessManager.sol/IATKSystemAccessManager.json`,
  // token
  accessManager: `${ARTIFACTS_DIR}/contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol/ISMARTTokenAccessManager.json`,
  identity: `${ARTIFACTS_DIR}/contracts/system/identity-factory/identities/ATKIdentityImplementation.sol/ATKIdentityImplementation.json`,
  contractIdentity: `${ARTIFACTS_DIR}/contracts/system/identity-factory/identities/ATKContractIdentityImplementation.sol/ATKContractIdentityImplementation.json`,
  // tokens
  deposit: `${ARTIFACTS_DIR}/contracts/assets/deposit/ATKDepositImplementation.sol/ATKDepositImplementation.json`,
  equity: `${ARTIFACTS_DIR}/contracts/assets/equity/IATKEquity.sol/IATKEquity.json`,
  fund: `${ARTIFACTS_DIR}/contracts/assets/fund/IATKFund.sol/IATKFund.json`,
  stablecoin: `${ARTIFACTS_DIR}/contracts/assets/stable-coin/IATKStableCoin.sol/IATKStableCoin.json`,
  bond: `${ARTIFACTS_DIR}/contracts/assets/bond/IATKBond.sol/IATKBond.json`,
  // registries
  tokenFactoryRegistry: `${ARTIFACTS_DIR}/contracts/system/tokens/factory/IATKTokenFactoryRegistry.sol/IATKTokenFactoryRegistry.json`,
  complianceModuleRegistry: `${ARTIFACTS_DIR}/contracts/system/compliance/IATKComplianceModuleRegistry.sol/IATKComplianceModuleRegistry.json`,
  systemAddonRegistry: `${ARTIFACTS_DIR}/contracts/system/addons/IATKSystemAddonRegistry.sol/IATKSystemAddonRegistry.json`,
  // Open Zeppelin
  accessControl: `${ARTIFACTS_DIR}/@openzeppelin/contracts/access/IAccessControl.sol/IAccessControl.json`,
  // smart
  ismart: `${ARTIFACTS_DIR}/contracts/smart/interface/ISMART.sol/ISMART.json`,
  ismartBurnable: `${ARTIFACTS_DIR}/contracts/smart/extensions/burnable/ISMARTBurnable.sol/ISMARTBurnable.json`,
  ismartCustodian: `${ARTIFACTS_DIR}/contracts/smart/extensions/custodian/ISMARTCustodian.sol/ISMARTCustodian.json`,
  ismartPausable: `${ARTIFACTS_DIR}/contracts/smart/extensions/pausable/ISMARTPausable.sol/ISMARTPausable.json`,
  ismartYield: `${ARTIFACTS_DIR}/contracts/smart/extensions/yield/ISMARTYield.sol/ISMARTYield.json`,
  ismartFixedYieldSchedule: `${ARTIFACTS_DIR}/contracts/smart/extensions/yield/schedules/fixed/ISMARTFixedYieldSchedule.sol/ISMARTFixedYieldSchedule.json`,
  ismartCapped: `${ARTIFACTS_DIR}/contracts/smart/extensions/capped/ISMARTCapped.sol/ISMARTCapped.json`,
  ismartRedeemable: `${ARTIFACTS_DIR}/contracts/smart/extensions/redeemable/ISMARTRedeemable.sol/ISMARTRedeemable.json`,
  // compliance modules
  identityVerification: `${ARTIFACTS_DIR}/contracts/smart/modules/SMARTIdentityVerificationComplianceModule.sol/SMARTIdentityVerificationComplianceModule.json`,
  countryAllowList: `${ARTIFACTS_DIR}/contracts/smart/modules/CountryAllowListComplianceModule.sol/CountryAllowListComplianceModule.json`,
  countryBlockList: `${ARTIFACTS_DIR}/contracts/smart/modules/CountryBlockListComplianceModule.sol/CountryBlockListComplianceModule.json`,
  addressBlockList: `${ARTIFACTS_DIR}/contracts/smart/modules/AddressBlockListComplianceModule.sol/AddressBlockListComplianceModule.json`,
  identityBlockList: `${ARTIFACTS_DIR}/contracts/smart/modules/IdentityBlockListComplianceModule.sol/IdentityBlockListComplianceModule.json`,
  identityAllowList: `${ARTIFACTS_DIR}/contracts/smart/modules/IdentityAllowListComplianceModule.sol/IdentityAllowListComplianceModule.json`,
  tokenSupplyLimit: `${ARTIFACTS_DIR}/contracts/smart/modules/TokenSupplyLimitComplianceModule.sol/TokenSupplyLimitComplianceModule.json`,
  investorCount: `${ARTIFACTS_DIR}/contracts/smart/modules/InvestorCountComplianceModule.sol/InvestorCountComplianceModule.json`,
  timeLock: `${ARTIFACTS_DIR}/contracts/smart/modules/TimeLockComplianceModule.sol/TimeLockComplianceModule.json`,
  transferApproval: `${ARTIFACTS_DIR}/contracts/smart/modules/TransferApprovalComplianceModule.sol/TransferApprovalComplianceModule.json`,
  // addons
  fixedYieldScheduleFactory: `${ARTIFACTS_DIR}/contracts/addons/yield/IATKFixedYieldScheduleFactory.sol/IATKFixedYieldScheduleFactory.json`,
  fixedYieldSchedule: `${ARTIFACTS_DIR}/contracts/addons/yield/ATKFixedYieldScheduleUpgradeable.sol/ATKFixedYieldScheduleUpgradeable.json`,
  vestingAirdropFactory: `${ARTIFACTS_DIR}/contracts/addons/airdrop/vesting-airdrop/IATKVestingAirdropFactory.sol/IATKVestingAirdropFactory.json`,
  pushAirdropFactory: `${ARTIFACTS_DIR}/contracts/addons/airdrop/push-airdrop/IATKPushAirdropFactory.sol/IATKPushAirdropFactory.json`,
  timeBoundAirdropFactory: `${ARTIFACTS_DIR}/contracts/addons/airdrop/time-bound-airdrop/IATKTimeBoundAirdropFactory.sol/IATKTimeBoundAirdropFactory.json`,
  xvpSettlementFactory: `${ARTIFACTS_DIR}/contracts/addons/xvp/IATKXvPSettlementFactory.sol/IATKXvPSettlementFactory.json`,
  xvpSettlement: `${ARTIFACTS_DIR}/contracts/addons/xvp/IATKXvPSettlement.sol/IATKXvPSettlement.json`,
} as const;

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
    "tokenFactoryRegistry",
    "complianceModuleRegistry",
    "systemAddonRegistry",
    "systemAccessManager",
  ],
  tokenInfrastructure: ["accessManager", "identity", "contractIdentity"],
  assetTokens: ["deposit", "equity", "fund", "stablecoin", "bond"],
  openZeppelin: ["accessControl"],
  coreSmart: [
    "ismart",
    "ismartBurnable",
    "ismartCustodian",
    "ismartPausable",
    "ismartYield",
    "ismartFixedYieldSchedule",
    "ismartCapped",
    "ismartRedeemable",
  ],
  complianceModules: [
    "identityVerification",
    "countryAllowList",
    "countryBlockList",
    "addressBlockList",
    "identityBlockList",
    "identityAllowList",
    "tokenSupplyLimit",
    "investorCount",
    "timeLock",
    "transferApproval",
  ],
  addons: [
    "fixedYieldScheduleFactory",
    "fixedYieldSchedule",
    "vestingAirdropFactory",
    "pushAirdropFactory",
    "timeBoundAirdropFactory",
    "xvpSettlementFactory",
    "xvpSettlement",
  ],
} satisfies Record<string, (keyof typeof ABI_PATHS)[]>;

const ALL_ABIS = [
  ...AVAILABLE_ABIS.onboarding,
  ...AVAILABLE_ABIS.tokenInfrastructure,
  ...AVAILABLE_ABIS.assetTokens,
  ...AVAILABLE_ABIS.openZeppelin,
  ...AVAILABLE_ABIS.coreSmart,
  ...AVAILABLE_ABIS.complianceModules,
  ...AVAILABLE_ABIS.addons,
];

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
  logger.info(`
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

    Core ATK:
      ${AVAILABLE_ABIS.coreSmart.join(", ")}

    Open Zeppelin:
      ${AVAILABLE_ABIS.openZeppelin.join(", ")}

    Compliance Modules:
      ${AVAILABLE_ABIS.complianceModules.join(", ")}

    Addons:
      ${AVAILABLE_ABIS.addons.join(", ")}
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
        // Note: SettleMint SDK logger level is set at creation time
        logger.info("Verbose mode requested (set LOG_LEVEL=debug in env)");
        break;
      case "-q":
      case "--quiet":
        // Note: SettleMint SDK logger level is set at creation time
        // Quiet mode can be achieved by setting LOG_LEVEL=error in env
        break;
      case "-l":
      case "--list":
        options.operationMode = "list";
        break;
      case "--skip-build":
        options.skipBuild = true;
        logger.info("Skip build mode enabled");
        break;
      default:
        if (arg?.startsWith("-")) {
          logger.error(`Unknown option: ${arg}`);
          showUsage();
          process.exit(1);
        } else {
          // Treat as ABI name
          options.operationMode = "generate-specific";
          if (arg) {
            options.specificAbis.push(arg);
          }
        }
        break;
    }
  }
}

async function compileContracts(): Promise<boolean> {
  if (options.skipBuild) {
    logger.info("Skipping contract compilation");
    return true;
  }

  logger.info("Compiling contracts with Hardhat...");

  try {
    // Set working directory for shell commands);
    $.cwd(CONTRACTS_ROOT);

    const result = await $`settlemint scs hardhat build`.quiet();

    if (result.exitCode === 0) {
      logger.info("Contracts compiled successfully");
      return true;
    } else {
      logger.error("Failed to compile contracts");
      if (result.stderr) {
        logger.error(result.stderr.toString());
      }
      return false;
    }
  } catch (err) {
    const shellError = err as $.ShellError;
    logger.info(shellError.stdout.toString());
    logger.error(shellError.stderr.toString());
    logger.error(`Failed to execute compilation`);
    return false;
  }
}

function listAbiNames(): void {
  logger.info("Available ABI names:");

  logger.info("\nOnboarding:");
  AVAILABLE_ABIS.onboarding.forEach((name) => logger.info(`  • ${name}`));

  logger.info("\nToken Infrastructure:");
  AVAILABLE_ABIS.tokenInfrastructure.forEach((name) =>
    logger.info(`  • ${name}`)
  );

  logger.info("\nAsset Tokens:");
  AVAILABLE_ABIS.assetTokens.forEach((name) => logger.info(`  • ${name}`));

  logger.info("\nCore ATK:");
  AVAILABLE_ABIS.coreSmart.forEach((name) => logger.info(`  • ${name}`));

  logger.info("\nOpen Zeppelin:");
  AVAILABLE_ABIS.openZeppelin.forEach((name) => logger.info(`  • ${name}`));

  logger.info("\nCompliance Modules:");
  AVAILABLE_ABIS.complianceModules.forEach((name) =>
    logger.info(`  • ${name}`)
  );

  logger.info("\nAddons:");
  AVAILABLE_ABIS.addons.forEach((name) => logger.info(`  • ${name}`));
}

async function findArtifactFile(contractName: string): Promise<string | null> {
  const artifactPath = ABI_PATHS[contractName as keyof typeof ABI_PATHS];
  if (artifactPath) {
    const file = Bun.file(artifactPath);
    if (await file.exists()) {
      return artifactPath;
    }
  }

  logger.warn(`Artifact not found for contract: ${contractName}`);
  return null;
}

async function generateAbiTyping(contractName: string): Promise<boolean> {
  const artifactPath = await findArtifactFile(contractName);
  if (!artifactPath) {
    return false;
  }

  try {
    const artifactFile = Bun.file(artifactPath);
    const artifact: ContractArtifact = await artifactFile.json();

    const abiContent = `// Generated automatically by codegen-types.ts
// Do not edit this file manually

export const ${contractName}Abi = ${JSON.stringify(artifact.abi, null, 2)} as const;

export type ${contractName}Abi = typeof ${contractName}Abi;
`;

    // Ensure output directory exists
    if (!existsSync(OUTPUT_DIR)) {
      await $`mkdir -p ${OUTPUT_DIR}`.quiet();
    }

    const outputPath = join(OUTPUT_DIR, `${contractName}.ts`);
    await Bun.write(outputPath, abiContent);

    logger.info(`Generated ABI typing for ${contractName}`);
    logger.debug(`Output written to: ${outputPath}`);

    return true;
  } catch (error) {
    logger.error(`Failed to generate ABI typing for ${contractName}: ${error}`);
    return false;
  }
}

async function generateAllAbiTypings(): Promise<boolean> {
  logger.info(`Generating ABI typings for ${ALL_ABIS.length} contracts...`);

  let successCount = 0;
  let failureCount = 0;

  for (const contractName of ALL_ABIS) {
    if (await generateAbiTyping(contractName)) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  logger.info(
    `Generation complete: ${successCount} successful, ${failureCount} failed`
  );
  return failureCount === 0;
}

async function generateSpecificAbiTypings(
  abiNames: string[]
): Promise<boolean> {
  // Validate ABI names
  const validAbiNames = new Set(ALL_ABIS);
  const invalidAbis = abiNames.filter(
    (name) => !validAbiNames.has(name as any)
  );
  if (invalidAbis.length > 0) {
    logger.error(`Invalid ABI names: ${invalidAbis.join(", ")}`);
    logger.info("Use --list to see available ABI names");
    return false;
  }

  logger.info(
    `Generating ABI typings for ${abiNames.length} specific contracts...`
  );

  let successCount = 0;
  let failureCount = 0;

  for (const contractName of abiNames) {
    if (await generateAbiTyping(contractName)) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  logger.info(
    `Generation complete: ${successCount} successful, ${failureCount} failed`
  );
  return failureCount === 0;
}

async function generateIndexFile(): Promise<void> {
  const exports: string[] = [];

  for (const name of ALL_ABIS) {
    const file = Bun.file(join(OUTPUT_DIR, `${name}.ts`));
    if (await file.exists()) {
      exports.push(`export * from "./${name}";`);
    }
  }

  const indexContent = `// Generated automatically by codegen-types.ts
// Do not edit this file manually

${exports.join("\n")}
`;

  const indexPath = join(OUTPUT_DIR, "index.ts");
  await Bun.write(indexPath, indexContent);
  logger.info("Generated index.ts file");
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main(): Promise<void> {
  logger.info("Starting ABI typings generation...");
  logger.debug(`Contracts root: ${CONTRACTS_ROOT}`);

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
        if (!(await generateAllAbiTypings())) {
          exitCode = 1;
          break;
        }

        await generateIndexFile();
        logger.info("All ABI typings generated successfully");
        break;

      case "generate-specific":
        // Compile contracts first
        if (!(await compileContracts())) {
          exitCode = 1;
          break;
        }

        // Generate specific ABI typings
        if (!(await generateSpecificAbiTypings(options.specificAbis))) {
          exitCode = 1;
          break;
        }

        await generateIndexFile();
        logger.info("Specific ABI typings generated successfully");
        break;

      default:
        logger.error(`Unknown operation mode: ${options.operationMode}`);
        exitCode = 1;
        break;
    }
  } catch (error) {
    logger.error(`Unexpected error: ${error}`);
    exitCode = 1;
  }

  process.exit(exitCode);
}

// Only run main if script is executed directly
if (import.meta.main) {
  await main();
}
