#!/usr/bin/env bun

/**
 * Genesis Output Generator
 *
 * This script deploys contracts to a temporary blockchain (Anvil) and generates
 * genesis allocations for use in production blockchain networks.
 */

import { $ } from "bun";
import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logger, LogLevel } from "../../../tools/logging";
import { getKitProjectPath } from "../../../tools/root";

// =============================================================================
// CONFIGURATION
// =============================================================================

interface Config {
  anvilPort: number;
  anvilBlockTime: number;
  forceRestartAnvil: boolean;
  keepAnvilRunning: boolean;
  showOutput: boolean;
}

const defaultConfig: Config = {
  anvilPort: 8545,
  anvilBlockTime: 1,
  forceRestartAnvil: false,
  keepAnvilRunning: false,
  showOutput: false,
};

const log = logger;

// File paths
const CONTRACTS_ROOT = await getKitProjectPath("contracts");
const FORGE_OUT_DIR = join(CONTRACTS_ROOT, "out-genesis");
const ALL_ALLOCATIONS_FILE = join(CONTRACTS_ROOT, "tools/genesis-output.json");

// Contract configuration
const CONTRACT_ADDRESSES = {
  // Core infrastructure
  ATKForwarder: "0x5e771e1417100000000000000000000000020099",

  // System implementations
  ATKComplianceImplementation: "0x5e771e1417100000000000000000000000020001",
  ATKIdentityRegistryImplementation:
    "0x5e771e1417100000000000000000000000020002",
  ATKIdentityRegistryStorageImplementation:
    "0x5e771e1417100000000000000000000000020003",
  ATKTrustedIssuersRegistryImplementation:
    "0x5e771e1417100000000000000000000000020004",
  ATKIdentityFactoryImplementation:
    "0x5e771e1417100000000000000000000000020005",
  ATKIdentityImplementation: "0x5e771e1417100000000000000000000000020006",
  ATKTokenIdentityImplementation: "0x5e771e1417100000000000000000000000020007",
  ATKTopicSchemeRegistryImplementation:
    "0x5e771e1417100000000000000000000000020008",
  ATKTokenAccessManagerImplementation:
    "0x5e771e1417100000000000000000000000020009",

  // System factory
  ATKSystemFactory: "0x5e771e1417100000000000000000000000020088",

  // Asset implementations
  ATKBondImplementation: "0x5e771e1417100000000000000000000000020010",
  ATKBondFactoryImplementation: "0x5e771e1417100000000000000000000000020011",
  ATKDepositImplementation: "0x5e771e1417100000000000000000000000020012",
  ATKDepositFactoryImplementation: "0x5e771e1417100000000000000000000000020013",
  ATKEquityImplementation: "0x5e771e1417100000000000000000000000020014",
  ATKEquityFactoryImplementation: "0x5e771e1417100000000000000000000000020015",
  ATKFundImplementation: "0x5e771e1417100000000000000000000000020016",
  ATKFundFactoryImplementation: "0x5e771e1417100000000000000000000000020017",
  ATKStableCoinImplementation: "0x5e771e1417100000000000000000000000020018",
  ATKStableCoinFactoryImplementation:
    "0x5e771e1417100000000000000000000000020019",

  // Compliance modules
  SMARTIdentityVerificationModule: "0x5e771e1417100000000000000000000000020100",
} as const;

const CONTRACT_FILES = {
  // Core infrastructure
  ATKForwarder: "contracts/vendor/ATKForwarder.sol",

  // System implementations
  ATKComplianceImplementation:
    "contracts/system/compliance/ATKComplianceImplementation.sol",
  ATKIdentityRegistryImplementation:
    "contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol",
  ATKIdentityRegistryStorageImplementation:
    "contracts/system/identity-registry-storage/ATKIdentityRegistryStorageImplementation.sol",
  ATKTrustedIssuersRegistryImplementation:
    "contracts/system/trusted-issuers-registry/ATKTrustedIssuersRegistryImplementation.sol",
  ATKIdentityFactoryImplementation:
    "contracts/system/identity-factory/ATKIdentityFactoryImplementation.sol",
  ATKIdentityImplementation:
    "contracts/system/identity-factory/identities/ATKIdentityImplementation.sol",
  ATKTokenIdentityImplementation:
    "contracts/system/identity-factory/identities/ATKTokenIdentityImplementation.sol",
  ATKTopicSchemeRegistryImplementation:
    "contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol",
  ATKTokenAccessManagerImplementation:
    "contracts/system/access-manager/ATKTokenAccessManagerImplementation.sol",

  // System factory
  ATKSystemFactory: "contracts/system/ATKSystemFactory.sol",

  // Asset implementations
  ATKBondImplementation: "contracts/assets/bond/ATKBondImplementation.sol",
  ATKBondFactoryImplementation:
    "contracts/assets/bond/ATKBondFactoryImplementation.sol",
  ATKDepositImplementation:
    "contracts/assets/deposit/ATKDepositImplementation.sol",
  ATKDepositFactoryImplementation:
    "contracts/assets/deposit/ATKDepositFactoryImplementation.sol",
  ATKEquityImplementation:
    "contracts/assets/equity/ATKEquityImplementation.sol",
  ATKEquityFactoryImplementation:
    "contracts/assets/equity/ATKEquityFactoryImplementation.sol",
  ATKFundImplementation: "contracts/assets/fund/ATKFundImplementation.sol",
  ATKFundFactoryImplementation:
    "contracts/assets/fund/ATKFundFactoryImplementation.sol",
  ATKStableCoinImplementation:
    "contracts/assets/stable-coin/ATKStableCoinImplementation.sol",
  ATKStableCoinFactoryImplementation:
    "contracts/assets/stable-coin/ATKStableCoinFactoryImplementation.sol",

  // Compliance modules
  SMARTIdentityVerificationModule:
    "contracts/smart/modules/SMARTIdentityVerificationModule.sol",
} as const;

// =============================================================================
// CONTRACT DEPLOYMENT
// =============================================================================

interface DeploymentResult {
  deployedAddress: string;
  bytecode: string;
  storage: Record<string, string>;
}

class ContractDeployer {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private getConstructorArgs(contractName: string): string[] {
    const forwarderAddress = CONTRACT_ADDRESSES.ATKForwarder;

    switch (contractName) {
      case "ATKForwarder":
        return [];

      case "SMARTIdentityVerificationModule":
        return [forwarderAddress];

      case "ATKSystemFactory":
        return [
          CONTRACT_ADDRESSES.ATKComplianceImplementation,
          CONTRACT_ADDRESSES.ATKIdentityRegistryImplementation,
          CONTRACT_ADDRESSES.ATKIdentityRegistryStorageImplementation,
          CONTRACT_ADDRESSES.ATKTrustedIssuersRegistryImplementation,
          CONTRACT_ADDRESSES.ATKTopicSchemeRegistryImplementation,
          CONTRACT_ADDRESSES.ATKIdentityFactoryImplementation,
          CONTRACT_ADDRESSES.ATKIdentityImplementation,
          CONTRACT_ADDRESSES.ATKTokenIdentityImplementation,
          CONTRACT_ADDRESSES.ATKTokenAccessManagerImplementation,
          CONTRACT_ADDRESSES.SMARTIdentityVerificationModule,
          forwarderAddress,
        ];

      default:
        return [forwarderAddress];
    }
  }

  async validateBytecode(solFile: string, contractName: string): Promise<void> {
    log.debug(`Validating bytecode for ${contractName}...`);

    const result = log.isLevelEnabled(LogLevel.DEBUG)
      ? await $`forge inspect ${solFile}:${contractName} bytecode --out ${FORGE_OUT_DIR}`.cwd(
          CONTRACTS_ROOT
        )
      : await $`forge inspect ${solFile}:${contractName} bytecode --out ${FORGE_OUT_DIR}`
          .cwd(CONTRACTS_ROOT)
          .quiet();

    if (result.exitCode !== 0) {
      log.error(`Forge inspect failed for ${contractName}: ${result.stderr}`);
      throw new Error(
        `Error getting bytecode for ${contractName}: ${result.stderr}`
      );
    }

    const bytecode = result.stdout.toString().trim();
    log.debug(`Raw bytecode for ${contractName}: ${bytecode.slice(0, 100)}...`);

    if (!bytecode || bytecode === "0x") {
      throw new Error(`Empty bytecode for ${contractName}`);
    }

    const bytecodeSize = (bytecode.length - 2) / 2; // Remove 0x and divide by 2
    const maxSize = 24576; // 24KB EIP-170 limit

    log.debug(`Contract ${contractName} bytecode size: ${bytecodeSize} bytes`);

    if (bytecodeSize > maxSize) {
      throw new Error(
        `Contract ${contractName} bytecode size (${bytecodeSize} bytes) exceeds ${maxSize} bytes EIP-170 limit`
      );
    }
  }

  async deployContract(solFile: string, contractName: string): Promise<string> {
    log.debug(`Deploying ${contractName}...`);

    const args = this.getConstructorArgs(contractName);
    const forgeArgs = [
      "forge",
      "create",
      `${solFile}:${contractName}`,
      "--broadcast",
      "--unlocked",
      "--from",
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "--json",
      "--rpc-url",
      `http://localhost:${this.config.anvilPort}`,
      "--optimize",
      "--optimizer-runs",
      "200",
    ];

    if (args.length > 0) {
      forgeArgs.push("--constructor-args", ...args);
      log.debug(`Using constructor args: ${args.join(" ")}`);
    }

    log.debug(`Forge command: ${forgeArgs.join(" ")}`);
    log.debug(`Working directory: ${CONTRACTS_ROOT}`);

    let result;
    if (args.length > 0) {
      result = log.isLevelEnabled(LogLevel.DEBUG)
        ? await $`forge create ${solFile}:${contractName} --broadcast --unlocked --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --json --rpc-url http://localhost:${this.config.anvilPort} --optimize --optimizer-runs 200 --out ${FORGE_OUT_DIR} --constructor-args ${args}`.cwd(
            CONTRACTS_ROOT
          )
        : await $`forge create ${solFile}:${contractName} --broadcast --unlocked --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --json --rpc-url http://localhost:${this.config.anvilPort} --optimize --optimizer-runs 200 --out ${FORGE_OUT_DIR} --constructor-args ${args}`
            .cwd(CONTRACTS_ROOT)
            .quiet();
    } else {
      result = log.isLevelEnabled(LogLevel.DEBUG)
        ? await $`forge create ${solFile}:${contractName} --broadcast --unlocked --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --json --rpc-url http://localhost:${this.config.anvilPort} --optimize --optimizer-runs 200 --out ${FORGE_OUT_DIR}`.cwd(
            CONTRACTS_ROOT
          )
        : await $`forge create ${solFile}:${contractName} --broadcast --unlocked --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --json --rpc-url http://localhost:${this.config.anvilPort} --optimize --optimizer-runs 200 --out ${FORGE_OUT_DIR}`
            .cwd(CONTRACTS_ROOT)
            .quiet();
    }

    const output = result.stdout.toString();
    const errorOutput = result.stderr.toString();

    log.debug(`Deployment exit code: ${result.exitCode}`);
    log.debug(`Deployment stdout: ${output}`);
    log.debug(`Deployment stderr: ${errorOutput}`);

    if (result.exitCode !== 0) {
      throw new Error(
        `Failed to deploy ${contractName}: ${errorOutput || output || "Unknown error"}`
      );
    }

    // Check if output looks like bytecode instead of JSON
    if (output.startsWith("0x") && !output.includes("{")) {
      log.warn(
        `Received bytecode instead of JSON for ${contractName}. This might indicate a compilation issue.`
      );
      log.debug(`Raw output: ${output.slice(0, 200)}...`);
      throw new Error(
        `Deployment failed - received bytecode instead of deployment JSON for ${contractName}`
      );
    }

    let deployData;
    try {
      deployData = JSON.parse(output);
    } catch (error) {
      log.error(`Error parsing JSON output for ${contractName}`);
      log.error(`Raw output: ${output}`);
      throw new Error(
        `Error parsing deployment output for ${contractName}: ${output.slice(0, 500)}...`
      );
    }

    const deployedAddress = deployData.deployedTo;
    if (!deployedAddress) {
      log.error(`Deployment data for ${contractName}:`, deployData);
      throw new Error(
        `Unable to get deployed address for ${contractName}. Full output: ${JSON.stringify(deployData, null, 2)}`
      );
    }

    log.debug(`${contractName} deployed to: ${deployedAddress}`);
    return deployedAddress;
  }

  async getStorageLayout(
    solFile: string,
    contractName: string,
    deployedAddress: string
  ): Promise<Record<string, string>> {
    log.debug(`Getting storage layout for ${contractName}...`);

    // Get storage layout from contract
    const layoutResult = log.isLevelEnabled(LogLevel.DEBUG)
      ? await $`forge inspect ${solFile}:${contractName} storageLayout --force --json --out ${FORGE_OUT_DIR}`.cwd(
          CONTRACTS_ROOT
        )
      : await $`forge inspect ${solFile}:${contractName} storageLayout --force --json --out ${FORGE_OUT_DIR}`
          .cwd(CONTRACTS_ROOT)
          .quiet();

    if (layoutResult.exitCode !== 0) {
      throw new Error(
        `Error getting storage layout for ${contractName}: ${layoutResult.stderr}`
      );
    }

    const storageLayout = JSON.parse(layoutResult.stdout.toString());
    const storage: Record<string, string> = {};

    if (!storageLayout.storage || storageLayout.storage.length === 0) {
      log.warn(`No storage slots found for ${contractName}`);
      return storage;
    }

    // Process storage slots
    for (const slot of storageLayout.storage) {
      try {
        const slotResult = log.isLevelEnabled(LogLevel.DEBUG)
          ? await $`cast storage --rpc-url http://localhost:${this.config.anvilPort} ${deployedAddress} ${slot.slot}`
          : await $`cast storage --rpc-url http://localhost:${this.config.anvilPort} ${deployedAddress} ${slot.slot}`.quiet();

        if (slotResult.exitCode === 0) {
          let slotValue = slotResult.stdout.toString().trim();

          // Validate and pad if needed
          if (slotValue.startsWith("0x")) {
            slotValue = slotValue.slice(2); // Remove 0x prefix
            slotValue = slotValue.padStart(64, "0"); // Pad to 32 bytes
            slotValue = `0x${slotValue}`;
          }

          const paddedSlot = `0x${slot.slot.toString().padStart(64, "0")}`;
          storage[paddedSlot] = slotValue;
        } else {
          log.warn(
            `Error reading storage slot ${slot.slot} for ${contractName}`
          );
        }
      } catch (error) {
        log.warn(
          `Error processing storage slot ${slot.slot} for ${contractName}: ${error}`
        );
      }
    }

    return storage;
  }

  async getDeployedBytecode(
    contractName: string,
    deployedAddress: string
  ): Promise<string> {
    log.debug(`Getting deployed bytecode for ${contractName}...`);

    const result = log.isLevelEnabled(LogLevel.DEBUG)
      ? await $`cast code --rpc-url http://localhost:${this.config.anvilPort} ${deployedAddress}`
      : await $`cast code --rpc-url http://localhost:${this.config.anvilPort} ${deployedAddress}`.quiet();

    if (result.exitCode !== 0) {
      throw new Error(
        `Error getting deployed bytecode for ${contractName}: ${result.stderr}`
      );
    }

    const bytecode = result.stdout.toString().trim();

    if (!bytecode || bytecode === "0x") {
      throw new Error(`Empty bytecode for deployed ${contractName}`);
    }

    // Remove 0x prefix for consistency
    return bytecode.startsWith("0x") ? bytecode.slice(2) : bytecode;
  }

  async deployAndProcess(
    solFile: string,
    contractName: string
  ): Promise<DeploymentResult> {
    // Test Anvil connection first
    log.debug(`Testing Anvil connection for ${contractName}...`);
    try {
      const response = await fetch(
        `http://localhost:${this.config.anvilPort}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_chainId",
            params: [],
            id: 1,
          }),
        }
      );
      const responseData = await response.json();
      log.debug(`Anvil response: ${JSON.stringify(responseData)}`);
    } catch (error) {
      throw new Error(`Failed to connect to Anvil: ${error}`);
    }

    // Validate bytecode size
    await this.validateBytecode(solFile, contractName);

    // Deploy contract
    const deployedAddress = await this.deployContract(solFile, contractName);

    // Get storage layout
    const storage = await this.getStorageLayout(
      solFile,
      contractName,
      deployedAddress
    );

    // Get deployed bytecode
    const bytecode = await this.getDeployedBytecode(
      contractName,
      deployedAddress
    );

    return {
      deployedAddress,
      bytecode,
      storage,
    };
  }
}

// =============================================================================
// GENESIS GENERATOR
// =============================================================================

class GenesisGenerator {
  private config: Config;
  private deployer: ContractDeployer;
  private processedCount = 0;
  private skippedCount = 0;
  private failedCount = 0;

  constructor(config: Config) {
    this.config = config;
    this.deployer = new ContractDeployer(config);
  }

  async initializeGenesisFile(): Promise<void> {
    log.info("Initializing genesis allocation file...");

    // Create forge output directory
    await mkdir(FORGE_OUT_DIR, { recursive: true });
    log.debug(`Created forge output directory: ${FORGE_OUT_DIR}`);

    // Remove existing file if it exists
    if (existsSync(ALL_ALLOCATIONS_FILE)) {
      await unlink(ALL_ALLOCATIONS_FILE);
      log.debug("Removed existing genesis file");
    }

    // Initialize empty JSON object
    await writeFile(ALL_ALLOCATIONS_FILE, "{}", "utf8");
    log.success("Genesis allocation file initialized");
  }

  async addToGenesis(
    contractName: string,
    targetAddress: string,
    bytecode: string,
    storage: Record<string, string>
  ): Promise<void> {
    log.debug(`Adding ${contractName} to genesis allocation...`);

    // Read current genesis file
    const currentGenesis = JSON.parse(
      await readFile(ALL_ALLOCATIONS_FILE, "utf8")
    );

    // Add contract allocation
    currentGenesis[targetAddress] = {
      balance: "0x0",
      code: `0x${bytecode}`,
      storage,
    };

    // Write back to file
    await writeFile(
      ALL_ALLOCATIONS_FILE,
      JSON.stringify(currentGenesis, null, 2),
      "utf8"
    );
    log.debug(`Added ${contractName} to genesis allocation`);
  }

  async processContract(
    contractName: keyof typeof CONTRACT_ADDRESSES,
    totalContracts: number
  ): Promise<void> {
    const targetAddress = CONTRACT_ADDRESSES[contractName];
    if (!targetAddress) {
      log.debug(`Skipping ${contractName}: Not in CONTRACT_ADDRESSES list`);
      this.skippedCount++;
      return;
    }

    // Show progress
    const progressPct = Math.floor(
      ((this.processedCount + this.failedCount + this.skippedCount) * 100) /
        totalContracts
    );
    log.debug(`[${progressPct}%] Processing ${contractName}...`);

    try {
      const solFile = join(CONTRACTS_ROOT, CONTRACT_FILES[contractName]);

      if (!existsSync(solFile)) {
        throw new Error(`Contract file not found: ${solFile}`);
      }

      const result = await this.deployer.deployAndProcess(
        solFile,
        contractName
      );
      await this.addToGenesis(
        contractName,
        targetAddress,
        result.bytecode,
        result.storage
      );

      this.processedCount++;
      log.debug(`Successfully processed ${contractName}`);

      // Show concise progress
      const totalProcessed = this.processedCount + this.failedCount;
      log.info(
        `Progress: ${totalProcessed}/${Object.keys(CONTRACT_ADDRESSES).length} contracts completed`
      );
    } catch (error) {
      this.failedCount++;
      log.error(`Failed to process ${contractName}: ${error}`);
      throw error;
    }
  }

  async processAllContracts(): Promise<void> {
    log.info("Processing all contracts...");

    const contractNames = Object.keys(CONTRACT_ADDRESSES);
    const totalContracts = contractNames.length;
    log.info(`Processing ${totalContracts} contracts...`);

    // Process ATKForwarder first (no dependencies)
    if (CONTRACT_ADDRESSES.ATKForwarder) {
      await this.processContract("ATKForwarder", totalContracts);
    }

    // Process all other contracts
    for (const contractName of contractNames) {
      if (contractName === "ATKForwarder") {
        continue; // Already processed
      }

      try {
        await this.processContract(
          contractName as keyof typeof CONTRACT_ADDRESSES,
          totalContracts
        );
      } catch (error) {
        log.error(`Error processing ${contractName}: ${error}`);
      }
    }

    if (this.processedCount === 0) {
      throw new Error("No contracts were processed successfully");
    }
  }

  async verifyAllContractsProcessed(): Promise<void> {
    log.info("Verifying all contracts were processed...");

    if (!existsSync(ALL_ALLOCATIONS_FILE)) {
      throw new Error(`Genesis file not found: ${ALL_ALLOCATIONS_FILE}`);
    }

    const genesisData = JSON.parse(
      await readFile(ALL_ALLOCATIONS_FILE, "utf8")
    );
    const genesisAddresses = Object.keys(genesisData);
    const expectedTotal = Object.keys(CONTRACT_ADDRESSES).length;
    const missingContracts: string[] = [];

    // Check each expected contract address
    for (const [contractName, expectedAddress] of Object.entries(
      CONTRACT_ADDRESSES
    )) {
      if (
        !genesisAddresses.find(
          (addr) => addr.toLowerCase() === expectedAddress.toLowerCase()
        )
      ) {
        missingContracts.push(`${contractName} (${expectedAddress})`);
      }
    }

    log.debug(`Expected contracts: ${expectedTotal}`);
    log.debug(`Processed contracts: ${genesisAddresses.length}`);

    if (missingContracts.length > 0) {
      log.error("The following contracts are missing from the genesis file:");
      for (const contract of missingContracts) {
        log.error(`  - ${contract}`);
      }
      throw new Error(
        "Genesis generation incomplete - not all contracts were processed"
      );
    }

    log.success(`All ${expectedTotal} contracts were successfully processed!`);
  }

  async cleanupForgeOutput(): Promise<void> {
    log.info("Cleaning up forge output directory...");

    try {
      if (existsSync(FORGE_OUT_DIR)) {
        await $`rm -rf ${FORGE_OUT_DIR}`.quiet();
        log.debug(`Removed forge output directory: ${FORGE_OUT_DIR}`);
      }
    } catch (error) {
      log.warn(`Failed to cleanup forge output directory: ${error}`);
    }
  }

  getStats(): { processed: number; skipped: number; failed: number } {
    return {
      processed: this.processedCount,
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
Usage: bun run codegen-genesis.ts [OPTIONS]

This script deploys contracts to a temporary blockchain and generates genesis allocations.
Uses an alternative output directory (out-genesis) to avoid conflicts with other tasks.

To copy the generated genesis file to the charts directory, run:
    bun run copy-artifacts --genesis-only

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging (DEBUG level)
    -q, --quiet             Enable quiet mode (ERROR level only)
    -p, --port PORT         Set Anvil port (default: 8545)
    -b, --block-time TIME   Set Anvil block time in seconds (default: 1)
    -r, --restart-anvil     Force restart Anvil if already running
    -k, --keep-anvil        Keep Anvil running after script completion
    --show-output           Display final genesis JSON output

ENVIRONMENT VARIABLES:
    LOG_LEVEL               Set logging level (DEBUG, INFO, WARN, ERROR)
    ANVIL_PORT              Set Anvil port
    ANVIL_BLOCK_TIME        Set Anvil block time
    FORCE_RESTART_ANVIL     Set to 'true' to restart Anvil
    KEEP_ANVIL_RUNNING      Set to 'true' to keep Anvil running

EXAMPLES:
    bun run codegen-genesis.ts                    # Run with default settings
    bun run codegen-genesis.ts --verbose          # Run with verbose output
    bun run codegen-genesis.ts -p 8546            # Use port 8546 for Anvil
    bun run codegen-genesis.ts --restart-anvil    # Force restart Anvil
    bun run codegen-genesis.ts --keep-anvil       # Keep Anvil running after completion

PREREQUISITES:
    - Forge project with foundry.toml
    - Compiled contracts (run 'forge build' first)
    - Foundry toolchain (forge, cast, anvil)
    - Bun runtime
`);
}

function parseCliArgs(): Config {
  const config = { ...defaultConfig };

  // Parse environment variables
  if (process.env.LOG_LEVEL) {
    const level = process.env.LOG_LEVEL.toUpperCase();
    if (["DEBUG", "INFO", "WARN", "ERROR"].includes(level)) {
      log.setLevel(level);
    }
  }
  if (process.env.ANVIL_PORT) {
    config.anvilPort = parseInt(process.env.ANVIL_PORT, 10);
  }
  if (process.env.ANVIL_BLOCK_TIME) {
    config.anvilBlockTime = parseInt(process.env.ANVIL_BLOCK_TIME, 10);
  }
  if (process.env.FORCE_RESTART_ANVIL === "true") {
    config.forceRestartAnvil = true;
  }
  if (process.env.KEEP_ANVIL_RUNNING === "true") {
    config.keepAnvilRunning = true;
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
        log.setLevel(LogLevel.DEBUG);
        break;

      case "-q":
      case "--quiet":
        log.setLevel(LogLevel.ERROR);
        break;

      case "-p":
      case "--port":
        const port = parseInt(args[++i] ?? "", 10);
        if (isNaN(port)) {
          console.error("Option --port requires a valid port number");
          process.exit(1);
        }
        config.anvilPort = port;
        break;

      case "-b":
      case "--block-time":
        const blockTime = parseInt(args[++i] ?? "", 10);
        if (isNaN(blockTime)) {
          console.error("Option --block-time requires a valid number");
          process.exit(1);
        }
        config.anvilBlockTime = blockTime;
        break;

      case "-r":
      case "--restart-anvil":
        config.forceRestartAnvil = true;
        break;

      case "-k":
      case "--keep-anvil":
        config.keepAnvilRunning = true;
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

  log.info("Starting Genesis Output Generator...");
  log.info(`Contracts root: ${CONTRACTS_ROOT}`);
  log.info(`Anvil port: ${config.anvilPort}`);

  // Check prerequisites
  log.info("Checking prerequisites...");

  // Check if forge is available
  try {
    const forgeResult = log.isLevelEnabled(LogLevel.DEBUG)
      ? await $`forge --version`.cwd(CONTRACTS_ROOT)
      : await $`forge --version`.cwd(CONTRACTS_ROOT).quiet();
    log.debug(`Forge version: ${forgeResult.stdout}`);
  } catch (error) {
    throw new Error("Forge not found. Please install Foundry.");
  }

  // Check if anvil is available
  try {
    const anvilResult = log.isLevelEnabled(LogLevel.DEBUG)
      ? await $`anvil --version`
      : await $`anvil --version`.quiet();
    log.debug(`Anvil version: ${anvilResult.stdout}`);
  } catch (error) {
    throw new Error("Anvil not found. Please install Foundry.");
  }

  const generator = new GenesisGenerator(config);

  try {
    // Initialize genesis file
    await generator.initializeGenesisFile();

    // Process all contracts
    await generator.processAllContracts();

    // Verify all contracts were processed
    await generator.verifyAllContractsProcessed();

    // Cleanup forge output directory
    await generator.cleanupForgeOutput();

    const stats = generator.getStats();
    log.success("Genesis generation completed successfully!");
    log.info(
      `Processing summary: ${stats.processed} processed, ${stats.skipped} skipped, ${stats.failed} failed`
    );
    log.info(`Genesis allocation written to: ${ALL_ALLOCATIONS_FILE}`);

    // Show output if requested
    if (config.showOutput) {
      console.log("=== GENESIS OUTPUT ===");
      const genesisContent = await readFile(ALL_ALLOCATIONS_FILE, "utf8");
      console.log(genesisContent);
    }
  } catch (error) {
    // Cleanup forge output directory even on error
    try {
      await generator.cleanupForgeOutput();
    } catch (cleanupError) {
      log.warn(`Failed to cleanup on error: ${cleanupError}`);
    }

    log.error(`Genesis generation failed: ${error}`);
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
