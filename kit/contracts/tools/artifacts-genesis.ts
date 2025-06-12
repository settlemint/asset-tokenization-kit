#!/usr/bin/env bun

/**
 * Genesis Output Generator
 *
 * This script deploys contracts to a temporary blockchain (Anvil) and generates
 * genesis allocations for use in production blockchain networks. It combines
 * the contract allocations with the genesis template to create the final genesis.json.
 *
 * Optimized for Bun runtime with native file operations and efficient JSON handling.
 */

import { $ } from "bun";
import { logger, LogLevel } from "../../../tools/logging";
import { findTurboRoot, getKitProjectPath } from "../../../tools/root";

// =============================================================================
// CONFIGURATION
// =============================================================================

interface Config {
  anvilPort: number;
  forceRestartAnvil: boolean;
  keepAnvilRunning: boolean;
  showOutput: boolean;
}

const defaultConfig: Config = {
  anvilPort: 8546,
  forceRestartAnvil: false,
  keepAnvilRunning: false,
  showOutput: false,
};

const log = logger;

// File paths
const CONTRACTS_ROOT = await getKitProjectPath("contracts");
const FORGE_OUT_DIR = `${CONTRACTS_ROOT}/out-genesis`;
const ALL_ALLOCATIONS_FILE = `${CONTRACTS_ROOT}/tools/genesis-output.json`;
const ROOT_DIR = (await findTurboRoot())?.monorepoRoot;
const GENESIS_FILE = `${ROOT_DIR}/tools/docker/besu/genesis.json`;

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

  // System
  ATKSystemImplementation: "0x5e771e1417100000000000000000000000020087",
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

  // System
  ATKSystemImplementation: "contracts/system/ATKSystemImplementation.sol",
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
// ANVIL NODE MANAGER
// =============================================================================

class AnvilManager {
  private config: Config;
  private anvilProcess: any = null;

  constructor(config: Config) {
    this.config = config;
  }

  async isAnvilRunning(): Promise<boolean> {
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
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (response.ok) {
        const data = await response.json();
        log.debug(`Anvil response: ${JSON.stringify(data)}`);
        return true;
      }

      log.debug(
        `Anvil HTTP response not OK: ${response.status} ${response.statusText}`
      );
      return false;
    } catch (error) {
      log.debug(`Anvil connection check failed: ${error}`);
      return false;
    }
  }

  async stopExistingAnvil(): Promise<void> {
    log.info("Stopping existing Anvil instances...");

    try {
      // Kill any existing anvil processes
      await $`pkill -f "anvil.*--port ${this.config.anvilPort}"`.quiet();
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
    } catch {
      // Ignore errors - process might not exist
    }

    // Verify it's stopped
    const isStillRunning = await this.isAnvilRunning();
    if (isStillRunning) {
      throw new Error(
        `Failed to stop existing Anvil on port ${this.config.anvilPort}`
      );
    }

    log.debug("Existing Anvil instances stopped");
  }

  async startAnvil(): Promise<void> {
    log.info(`Starting Anvil on port ${this.config.anvilPort}...`);

    // Check if anvil is available
    try {
      const anvilCheck = await $`which anvil`.quiet();
      if (anvilCheck.exitCode !== 0) {
        throw new Error("Anvil not found in PATH. Please install Foundry.");
      }
      log.debug(`Anvil found at: ${anvilCheck.stdout.toString().trim()}`);
    } catch (error) {
      throw new Error("Anvil not found in PATH. Please install Foundry.");
    }

    const anvilArgs = ["anvil", "--port", this.config.anvilPort.toString()];

    log.debug(`Starting Anvil with args: ${anvilArgs.join(" ")}`);

    // Capture stdout and stderr for debugging
    const stdout = log.isLevelEnabled(LogLevel.DEBUG) ? "inherit" : "pipe";
    const stderr = log.isLevelEnabled(LogLevel.DEBUG) ? "inherit" : "pipe";

    // Start anvil in background
    this.anvilProcess = Bun.spawn(anvilArgs, {
      stdout,
      stderr,
    });

    // Check if process started successfully
    if (!this.anvilProcess) {
      throw new Error("Failed to spawn Anvil process");
    }

    // Wait for Anvil to be ready
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      // Check if process is still alive
      if (this.anvilProcess.exitCode !== null) {
        const exitCode = this.anvilProcess.exitCode;
        let errorOutput = "";

        if (!log.isLevelEnabled(LogLevel.DEBUG) && this.anvilProcess.stderr) {
          try {
            const stderr = await new Response(this.anvilProcess.stderr).text();
            errorOutput = stderr;
          } catch {
            // Ignore stderr read errors
          }
        }

        throw new Error(
          `Anvil process exited with code ${exitCode}. ${errorOutput ? `Error: ${errorOutput}` : ""}`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (await this.isAnvilRunning()) {
        log.success(
          `Anvil started successfully on port ${this.config.anvilPort}`
        );
        return;
      }

      attempts++;
      log.debug(
        `Waiting for Anvil to start... (attempt ${attempts}/${maxAttempts})`
      );
    }

    // If we get here, Anvil failed to start
    let errorOutput = "";
    if (!log.isLevelEnabled(LogLevel.DEBUG) && this.anvilProcess.stderr) {
      try {
        const stderr = await new Response(this.anvilProcess.stderr).text();
        errorOutput = stderr;
      } catch {
        // Ignore stderr read errors
      }
    }

    throw new Error(
      `Anvil failed to start after ${maxAttempts} attempts. ${errorOutput ? `Error: ${errorOutput}` : "Check if port ${this.config.anvilPort} is available."}`
    );
  }

  async stopAnvil(): Promise<void> {
    if (this.anvilProcess) {
      log.info("Stopping Anvil...");
      this.anvilProcess.kill();
      this.anvilProcess = null;

      // Wait a bit for graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 2000));
      log.debug("Anvil stopped");
    }
  }

  async testAnvilCommand(): Promise<void> {
    log.debug("Testing Anvil command...");
    try {
      const testResult = await $`anvil --version`.quiet();
      if (testResult.exitCode === 0) {
        log.debug(`Anvil version: ${testResult.stdout.toString().trim()}`);
      } else {
        throw new Error(`Anvil version check failed: ${testResult.stderr}`);
      }
    } catch (error) {
      throw new Error(`Anvil command test failed: ${error}`);
    }
  }

  async checkPortAvailability(): Promise<void> {
    log.debug(`Checking if port ${this.config.anvilPort} is available...`);
    try {
      // Try to connect to the port to see if something is already running
      const response = await fetch(
        `http://localhost:${this.config.anvilPort}`,
        {
          signal: AbortSignal.timeout(2000),
        }
      );

      // If we get a response, something is running on this port
      log.warn(
        `Port ${this.config.anvilPort} is already in use by another service`
      );
    } catch (error) {
      // If connection fails, port is likely available
      log.debug(`Port ${this.config.anvilPort} appears to be available`);
    }
  }

  async ensureAnvilRunning(): Promise<void> {
    // Test anvil command first
    await this.testAnvilCommand();

    const isRunning = await this.isAnvilRunning();

    if (isRunning && !this.config.forceRestartAnvil) {
      log.info(`Anvil already running on port ${this.config.anvilPort}`);
      return;
    }

    if (isRunning && this.config.forceRestartAnvil) {
      await this.stopExistingAnvil();
    } else if (!isRunning) {
      // Check if port is available before starting
      await this.checkPortAvailability();
    }

    await this.startAnvil();
  }

  async cleanup(): Promise<void> {
    if (!this.config.keepAnvilRunning) {
      await this.stopAnvil();
    } else {
      log.info(
        `Keeping Anvil running on port ${this.config.anvilPort} as requested`
      );
    }
  }
}

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

      case "ATKSystemFactory":
        return [
          CONTRACT_ADDRESSES.ATKSystemImplementation,
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
  private anvilManager: AnvilManager;
  private processedCount = 0;
  private skippedCount = 0;
  private failedCount = 0;

  constructor(config: Config) {
    this.config = config;
    this.deployer = new ContractDeployer(config);
    this.anvilManager = new AnvilManager(config);
  }

  async startAnvil(): Promise<void> {
    await this.anvilManager.ensureAnvilRunning();
  }

  async stopAnvil(): Promise<void> {
    await this.anvilManager.cleanup();
  }

  async initializeGenesisFile(): Promise<void> {
    log.info("Initializing genesis allocation file...");

    // Create forge output directory
    await $`mkdir -p ${FORGE_OUT_DIR}`.quiet();
    log.debug(`Created forge output directory: ${FORGE_OUT_DIR}`);

    // Remove existing file if it exists
    const allocFile = Bun.file(ALL_ALLOCATIONS_FILE);
    if (await allocFile.exists()) {
      await $`rm -f ${ALL_ALLOCATIONS_FILE}`.quiet();
      log.debug("Removed existing genesis file");
    }

    // Initialize empty JSON object
    await Bun.write(ALL_ALLOCATIONS_FILE, "{}");
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
    const allocFile = Bun.file(ALL_ALLOCATIONS_FILE);
    const currentGenesis = await allocFile.json();

    // Add contract allocation
    currentGenesis[targetAddress] = {
      balance: "0x0",
      code: `0x${bytecode}`,
      storage,
    };

    // Write back to file
    await Bun.write(
      ALL_ALLOCATIONS_FILE,
      JSON.stringify(currentGenesis, null, 2)
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
      const solFile = `${CONTRACTS_ROOT}/${CONTRACT_FILES[contractName]}`;

      const contractFile = Bun.file(solFile);
      if (!(await contractFile.exists())) {
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
      console.error(error);
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

    const allocFile = Bun.file(ALL_ALLOCATIONS_FILE);
    if (!(await allocFile.exists())) {
      throw new Error(`Genesis file not found: ${ALL_ALLOCATIONS_FILE}`);
    }

    const genesisData = await allocFile.json();
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

  async generateFinalGenesis(): Promise<void> {
    log.info("Generating final genesis.json file...");

    // Check if template exists
    const genesisFile = Bun.file(GENESIS_FILE);
    if (!(await genesisFile.exists())) {
      throw new Error(`Genesis not found: ${GENESIS_FILE}`);
    }

    // Check if allocations exist
    const allocFile = Bun.file(ALL_ALLOCATIONS_FILE);
    if (!(await allocFile.exists())) {
      throw new Error(`Genesis allocations not found: ${ALL_ALLOCATIONS_FILE}`);
    }

    try {
      // Read template and allocations
      const template = await genesisFile.json();
      const contractAllocations = await allocFile.json();

      log.debug(
        `Template allocations: ${Object.keys(template.alloc || {}).length}`
      );
      log.debug(
        `Contract allocations: ${Object.keys(contractAllocations).length}`
      );

      // Merge allocations
      const finalGenesis = {
        ...template,
        alloc: contractAllocations,
      };

      // Ensure output directory exists
      const outputDir = `${CONTRACTS_ROOT}/tools/docker/besu`;
      await $`mkdir -p ${outputDir}`.quiet();

      // Validate the final genesis structure
      if (!finalGenesis.config || !finalGenesis.alloc) {
        throw new Error("Invalid genesis structure: missing config or alloc");
      }

      // Write final genesis file
      await Bun.write(GENESIS_FILE, JSON.stringify(finalGenesis, null, 2));

      log.success(`Final genesis file written to: ${GENESIS_FILE}`);
      log.info(
        `Total allocations: ${Object.keys(finalGenesis.alloc).length} (${
          Object.keys(template.alloc || {}).length
        } from template + ${Object.keys(contractAllocations).length} contracts)`
      );

      // Verify the written file can be read back
      const verificationFile = Bun.file(GENESIS_FILE);
      const verification = await verificationFile.json();
      if (!verification.config || !verification.alloc) {
        throw new Error("Written genesis file is invalid");
      }
      log.debug("Genesis file verification passed");
    } catch (error) {
      throw new Error(`Failed to generate final genesis file: ${error}`);
    }
  }

  async cleanupForgeOutput(): Promise<void> {
    log.info("Cleaning up forge output directory...");

    try {
      const forgeDir = Bun.file(FORGE_OUT_DIR);
      if (await forgeDir.exists()) {
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
It combines the contract allocations with the genesis template to create the final genesis.json.
Uses an alternative output directory (out-genesis) to avoid conflicts with other tasks.

To copy the generated genesis file to the charts directory, run:
    bun run copy-artifacts --genesis-only

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging (DEBUG level)
    -q, --quiet             Enable quiet mode (ERROR level only)
    -p, --port PORT         Set Anvil port (default: 8546)
    -r, --restart-anvil     Force restart Anvil if already running
    -k, --keep-anvil        Keep Anvil running after script completion
    --show-output           Display final genesis.json output

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
  globalGenerator = generator;

  try {
    // Start Anvil
    await generator.startAnvil();

    // Initialize genesis file
    await generator.initializeGenesisFile();

    // Process all contracts
    await generator.processAllContracts();

    // Verify all contracts were processed
    await generator.verifyAllContractsProcessed();

    // Generate final genesis.json file
    await generator.generateFinalGenesis();

    // Cleanup forge output directory
    await generator.cleanupForgeOutput();

    // Stop Anvil (unless keepAnvilRunning is true)
    await generator.stopAnvil();

    const stats = generator.getStats();
    log.success("Genesis generation completed successfully!");
    log.info(
      `Processing summary: ${stats.processed} processed, ${stats.skipped} skipped, ${stats.failed} failed`
    );
    log.info(`Contract allocations written to: ${ALL_ALLOCATIONS_FILE}`);
    log.info(`Final genesis file written to: ${GENESIS_FILE}`);

    // Show output if requested
    if (config.showOutput) {
      console.log("=== FINAL GENESIS OUTPUT ===");
      const genesisFile = Bun.file(GENESIS_FILE);
      const genesisContent = await genesisFile.text();
      console.log(genesisContent);
    }
  } catch (error) {
    // Cleanup on error
    try {
      await generator.cleanupForgeOutput();
      await generator.stopAnvil();
    } catch (cleanupError) {
      log.warn(`Failed to cleanup on error: ${cleanupError}`);
    }

    log.error(`Genesis generation failed: ${error}`);
    process.exit(1);
  }
}

// Global generator reference for cleanup
let globalGenerator: GenesisGenerator | null = null;

// Handle process interruption
process.on("SIGINT", async () => {
  log.info("Received SIGINT, cleaning up...");
  if (globalGenerator) {
    try {
      await globalGenerator.stopAnvil();
    } catch (error) {
      log.warn(`Error during cleanup: ${error}`);
    }
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  log.info("Received SIGTERM, cleaning up...");
  if (globalGenerator) {
    try {
      await globalGenerator.stopAnvil();
    } catch (error) {
      log.warn(`Error during cleanup: ${error}`);
    }
  }
  process.exit(0);
});

// Run the script
if (import.meta.main) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}
