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

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { $ } from "bun";
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

const logger = createLogger({
  level: process.env.CLAUDECODE
    ? "error"
    : (process.env.LOG_LEVEL as LogLevel) ||
      (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) ||
      "info",
});

// File paths
const CONTRACTS_ROOT = await getKitProjectPath("contracts");
const FORGE_OUT_DIR = `${CONTRACTS_ROOT}/.generated/out-genesis`;
const FORGE_CACHE_DIR = `${CONTRACTS_ROOT}/.generated/cache-genesis`;
const OUTPUT_DIR = `${CONTRACTS_ROOT}/.generated`;
const ALL_ALLOCATIONS_FILE = `${OUTPUT_DIR}/genesis-allocations.json`;
const ROOT_DIR = (await findTurboRoot())?.monorepoRoot;
const GENESIS_TEMPLATE_FILE = `${ROOT_DIR}/tools/docker/besu/genesis.json`;
const CONTRACTS_GENESIS_FILE = `${OUTPUT_DIR}/genesis.json`;

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
  ATKSystemTrustedIssuersRegistryImplementation:
    "0x5e771e1417100000000000000000000000020004",
  ATKIdentityFactoryImplementation:
    "0x5e771e1417100000000000000000000000020005",
  ATKIdentityImplementation: "0x5e771e1417100000000000000000000000020006",
  ATKContractIdentityImplementation:
    "0x5e771e1417100000000000000000000000020007",
  ATKTopicSchemeRegistryImplementation:
    "0x5e771e1417100000000000000000000000020008",
  ATKTokenAccessManagerImplementation:
    "0x5e771e1417100000000000000000000000020009",

  // System access manager implementation
  ATKSystemAccessManagerImplementation:
    "0x5e771e141710000000000000000000000002000a",

  // Registry implementations
  ATKTokenFactoryRegistryImplementation:
    "0x5e771e1417100000000000000000000000020010",
  ATKComplianceModuleRegistryImplementation:
    "0x5e771e1417100000000000000000000000020011",
  ATKSystemAddonRegistryImplementation:
    "0x5e771e1417100000000000000000000000020012",

  // System
  ATKSystemImplementation: "0x5e771e1417100000000000000000000000020087",
  ATKSystemFactory: "0x5e771e1417100000000000000000000000020088",

  // Asset implementations
  ATKBondImplementation: "0x5e771e1417100000000000000000000000020020",
  ATKBondFactoryImplementation: "0x5e771e1417100000000000000000000000020021",
  ATKDepositImplementation: "0x5e771e1417100000000000000000000000020022",
  ATKDepositFactoryImplementation: "0x5e771e1417100000000000000000000000020023",
  ATKEquityImplementation: "0x5e771e1417100000000000000000000000020024",
  ATKEquityFactoryImplementation: "0x5e771e1417100000000000000000000000020025",
  ATKFundImplementation: "0x5e771e1417100000000000000000000000020026",
  ATKFundFactoryImplementation: "0x5e771e1417100000000000000000000000020027",
  ATKStableCoinImplementation: "0x5e771e1417100000000000000000000000020028",
  ATKStableCoinFactoryImplementation:
    "0x5e771e1417100000000000000000000000020029",

  // Compliance modules
  SMARTIdentityVerificationComplianceModule:
    "0x5e771e1417100000000000000000000000020100",
  CountryAllowListComplianceModule:
    "0x5e771e1417100000000000000000000000020101",
  CountryBlockListComplianceModule:
    "0x5e771e1417100000000000000000000000020102",
  AddressBlockListComplianceModule:
    "0x5e771e1417100000000000000000000000020103",
  IdentityBlockListComplianceModule:
    "0x5e771e1417100000000000000000000000020104",
  IdentityAllowListComplianceModule:
    "0x5e771e1417100000000000000000000000020105",
  TokenSupplyLimitComplianceModule:
    "0x5e771e1417100000000000000000000000020106",
  InvestorCountComplianceModule: "0x5e771e1417100000000000000000000000020107",
  TimeLockComplianceModule: "0x5e771e1417100000000000000000000000020108",
  TransferApprovalComplianceModule:
    "0x5e771e1417100000000000000000000000020109",

  // Addon factory implementations
  ATKFixedYieldScheduleFactoryImplementation:
    "0x5e771e1417100000000000000000000000020030",
  ATKXvPSettlementImplementation: "0x5e771e1417100000000000000000000000020031",
  ATKXvPSettlementFactoryImplementation:
    "0x5e771e1417100000000000000000000000020032",
  ATKVestingAirdropFactoryImplementation:
    "0x5e771e1417100000000000000000000000020033",
  ATKPushAirdropFactoryImplementation:
    "0x5e771e1417100000000000000000000000020034",
  // Note: ATKVault and ATKVaultFactoryImplementation removed per https://linear.app/settlemint/issue/SRT-697/implementation-vs-configured-instance
  // These contracts should not be predeployed as implementations need proper configuration
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
  ATKSystemTrustedIssuersRegistryImplementation:
    "contracts/system/trusted-issuers-registry/ATKSystemTrustedIssuersRegistryImplementation.sol",
  ATKIdentityFactoryImplementation:
    "contracts/system/identity-factory/ATKIdentityFactoryImplementation.sol",
  ATKIdentityImplementation:
    "contracts/system/identity-factory/identities/ATKIdentityImplementation.sol",
  ATKContractIdentityImplementation:
    "contracts/system/identity-factory/identities/ATKContractIdentityImplementation.sol",
  ATKTopicSchemeRegistryImplementation:
    "contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol",
  ATKTokenAccessManagerImplementation:
    "contracts/system/tokens/access/ATKTokenAccessManagerImplementation.sol",
  ATKSystemAccessManagerImplementation:
    "contracts/system/access-manager/ATKSystemAccessManagerImplementation.sol",
  ATKTokenFactoryRegistryImplementation:
    "contracts/system/tokens/factory/ATKTokenFactoryRegistryImplementation.sol",
  ATKComplianceModuleRegistryImplementation:
    "contracts/system/compliance/ATKComplianceModuleRegistryImplementation.sol",
  ATKSystemAddonRegistryImplementation:
    "contracts/system/addons/ATKSystemAddonRegistryImplementation.sol",

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
  SMARTIdentityVerificationComplianceModule:
    "contracts/smart/modules/SMARTIdentityVerificationComplianceModule.sol",
  CountryAllowListComplianceModule:
    "contracts/smart/modules/CountryAllowListComplianceModule.sol",
  CountryBlockListComplianceModule:
    "contracts/smart/modules/CountryBlockListComplianceModule.sol",
  AddressBlockListComplianceModule:
    "contracts/smart/modules/AddressBlockListComplianceModule.sol",
  IdentityBlockListComplianceModule:
    "contracts/smart/modules/IdentityBlockListComplianceModule.sol",
  IdentityAllowListComplianceModule:
    "contracts/smart/modules/IdentityAllowListComplianceModule.sol",
  TokenSupplyLimitComplianceModule:
    "contracts/smart/modules/TokenSupplyLimitComplianceModule.sol",
  InvestorCountComplianceModule:
    "contracts/smart/modules/InvestorCountComplianceModule.sol",
  TimeLockComplianceModule:
    "contracts/smart/modules/TimeLockComplianceModule.sol",
  TransferApprovalComplianceModule:
    "contracts/smart/modules/TransferApprovalComplianceModule.sol",

  // Addon factory implementations
  ATKFixedYieldScheduleFactoryImplementation:
    "contracts/addons/yield/ATKFixedYieldScheduleFactoryImplementation.sol",
  ATKXvPSettlementImplementation:
    "contracts/addons/xvp/ATKXvPSettlementImplementation.sol",
  ATKXvPSettlementFactoryImplementation:
    "contracts/addons/xvp/ATKXvPSettlementFactoryImplementation.sol",
  ATKVestingAirdropFactoryImplementation:
    "contracts/addons/airdrop/vesting-airdrop/ATKVestingAirdropFactoryImplementation.sol",
  ATKPushAirdropFactoryImplementation:
    "contracts/addons/airdrop/push-airdrop/ATKPushAirdropFactoryImplementation.sol",
  // Note: ATKVault and ATKVaultFactoryImplementation removed per https://linear.app/settlemint/issue/SRT-697/implementation-vs-configured-instance
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if debug logging is enabled
 */
function isDebugEnabled(): boolean {
  return (
    process.env.LOG_LEVEL === "debug" ||
    process.env.SETTLEMINT_LOG_LEVEL === "debug"
  );
}

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
        logger.debug(`Anvil response: ${JSON.stringify(data)}`);
        return true;
      }

      logger.debug(
        `Anvil HTTP response not OK: ${response.status} ${response.statusText}`
      );
      return false;
    } catch (error) {
      logger.debug(`Anvil connection check failed: ${error}`);
      return false;
    }
  }

  async stopExistingAnvil(): Promise<void> {
    logger.info("Stopping existing Anvil instances...");

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

    logger.debug("Existing Anvil instances stopped");
  }

  async startAnvil(): Promise<void> {
    logger.info(`Starting Anvil on port ${this.config.anvilPort}...`);

    // Check if anvil is available
    try {
      const anvilCheck = await $`which anvil`.quiet();
      if (anvilCheck.exitCode !== 0) {
        throw new Error("Anvil not found in PATH. Please install Foundry.");
      }
      logger.debug(`Anvil found at: ${anvilCheck.stdout.toString().trim()}`);
    } catch (error) {
      throw new Error("Anvil not found in PATH. Please install Foundry.");
    }

    const anvilArgs = ["anvil", "--port", this.config.anvilPort.toString()];

    logger.debug(`Starting Anvil with args: ${anvilArgs.join(" ")}`);

    // Capture stdout and stderr for debugging
    // Note: SettleMint SDK logger doesn't have isLevelEnabled
    const stdout = isDebugEnabled() ? "inherit" : "pipe";
    const stderr = isDebugEnabled() ? "inherit" : "pipe";

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

        if (!isDebugEnabled() && this.anvilProcess.stderr) {
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
        logger.info(
          `Anvil started successfully on port ${this.config.anvilPort}`
        );
        return;
      }

      attempts++;
      logger.debug(
        `Waiting for Anvil to start... (attempt ${attempts}/${maxAttempts})`
      );
    }

    // If we get here, Anvil failed to start
    let errorOutput = "";
    if (!isDebugEnabled() && this.anvilProcess.stderr) {
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
      logger.info("Stopping Anvil...");
      this.anvilProcess.kill();
      this.anvilProcess = null;

      // Wait a bit for graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 2000));
      logger.debug("Anvil stopped");
    }
  }

  async testAnvilCommand(): Promise<void> {
    logger.debug("Testing Anvil command...");
    try {
      const testResult = await $`anvil --version`.quiet();
      if (testResult.exitCode === 0) {
        logger.debug(`Anvil version: ${testResult.stdout.toString().trim()}`);
      } else {
        throw new Error(`Anvil version check failed: ${testResult.stderr}`);
      }
    } catch (error) {
      throw new Error(`Anvil command test failed: ${error}`);
    }
  }

  async checkPortAvailability(): Promise<void> {
    logger.debug(`Checking if port ${this.config.anvilPort} is available...`);
    try {
      // Try to connect to the port to see if something is already running
      const response = await fetch(
        `http://localhost:${this.config.anvilPort}`,
        {
          signal: AbortSignal.timeout(2000),
        }
      );

      // If we get a response, something is running on this port
      logger.warn(
        `Port ${this.config.anvilPort} is already in use by another service`
      );
    } catch (error) {
      // If connection fails, port is likely available
      logger.debug(`Port ${this.config.anvilPort} appears to be available`);
    }
  }

  async ensureAnvilRunning(): Promise<void> {
    // Test anvil command first
    await this.testAnvilCommand();

    const isRunning = await this.isAnvilRunning();

    if (isRunning && !this.config.forceRestartAnvil) {
      logger.info(`Anvil already running on port ${this.config.anvilPort}`);
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
      logger.info(
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
          CONTRACT_ADDRESSES.ATKSystemTrustedIssuersRegistryImplementation,
          CONTRACT_ADDRESSES.ATKTopicSchemeRegistryImplementation,
          CONTRACT_ADDRESSES.ATKIdentityFactoryImplementation,
          CONTRACT_ADDRESSES.ATKIdentityImplementation,
          CONTRACT_ADDRESSES.ATKContractIdentityImplementation,
          CONTRACT_ADDRESSES.ATKTokenAccessManagerImplementation,
          CONTRACT_ADDRESSES.ATKTokenFactoryRegistryImplementation,
          CONTRACT_ADDRESSES.ATKComplianceModuleRegistryImplementation,
          CONTRACT_ADDRESSES.ATKSystemAddonRegistryImplementation,
          CONTRACT_ADDRESSES.ATKSystemAccessManagerImplementation,
          forwarderAddress,
        ];

      default:
        return [forwarderAddress];
    }
  }

  async validateBytecode(solFile: string, contractName: string): Promise<void> {
    logger.debug(`Validating bytecode for ${contractName}...`);

    const result = isDebugEnabled()
      ? await $`forge inspect ${solFile}:${contractName} bytecode --out ${FORGE_OUT_DIR} --cache-path ${FORGE_CACHE_DIR}`.cwd(
          CONTRACTS_ROOT
        )
      : await $`forge inspect ${solFile}:${contractName} bytecode --out ${FORGE_OUT_DIR} --cache-path ${FORGE_CACHE_DIR}`
          .cwd(CONTRACTS_ROOT)
          .quiet();

    if (result.exitCode !== 0) {
      logger.error(
        `Forge inspect failed for ${contractName}: ${result.stderr}`
      );
      throw new Error(
        `Error getting bytecode for ${contractName}: ${result.stderr}`
      );
    }

    const bytecode = result.stdout.toString().trim();
    logger.debug(
      `Raw bytecode for ${contractName}: ${bytecode.slice(0, 100)}...`
    );

    if (!bytecode || bytecode === "0x") {
      throw new Error(`Empty bytecode for ${contractName}`);
    }

    const bytecodeSize = (bytecode.length - 2) / 2; // Remove 0x and divide by 2
    const maxSize = 24576; // 24KB EIP-170 limit

    logger.debug(
      `Contract ${contractName} bytecode size: ${bytecodeSize} bytes`
    );

    if (bytecodeSize > maxSize) {
      throw new Error(
        `Contract ${contractName} bytecode size (${bytecodeSize} bytes) exceeds ${maxSize} bytes EIP-170 limit`
      );
    }
  }

  async deployContract(solFile: string, contractName: string): Promise<string> {
    logger.debug(`Deploying ${contractName}...`);

    const args = this.getConstructorArgs(contractName);
    const forgeArgs = [
      "forge",
      "create",
      `${solFile}:${contractName}`,
      "--broadcast",
      "--unlocked",
      "--from",
      "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
      "--json",
      "--rpc-url",
      `http://localhost:${this.config.anvilPort}`,
      "--optimize",
      "--optimizer-runs",
      "200",
    ];

    if (args.length > 0) {
      forgeArgs.push("--constructor-args", ...args);
      logger.debug(`Using constructor args: ${args.join(" ")}`);
    }

    logger.debug(`Forge command: ${forgeArgs.join(" ")}`);
    logger.debug(`Working directory: ${CONTRACTS_ROOT}`);

    let result;
    if (args.length > 0) {
      result = isDebugEnabled()
        ? await $`forge create ${solFile}:${contractName} --broadcast --unlocked --from 0x976EA74026E726554dB657fA54763abd0C3a0aa9 --json --rpc-url http://localhost:${this.config.anvilPort} --optimize --optimizer-runs 200 --out ${FORGE_OUT_DIR} --cache-path ${FORGE_CACHE_DIR} --constructor-args ${args}`.cwd(
            CONTRACTS_ROOT
          )
        : await $`forge create ${solFile}:${contractName} --broadcast --unlocked --from 0x976EA74026E726554dB657fA54763abd0C3a0aa9 --json --rpc-url http://localhost:${this.config.anvilPort} --optimize --optimizer-runs 200 --out ${FORGE_OUT_DIR} --cache-path ${FORGE_CACHE_DIR} --constructor-args ${args}`
            .cwd(CONTRACTS_ROOT)
            .quiet();
    } else {
      result = isDebugEnabled()
        ? await $`forge create ${solFile}:${contractName} --broadcast --unlocked --from 0x976EA74026E726554dB657fA54763abd0C3a0aa9 --json --rpc-url http://localhost:${this.config.anvilPort} --optimize --optimizer-runs 200 --out ${FORGE_OUT_DIR} --cache-path ${FORGE_CACHE_DIR}`.cwd(
            CONTRACTS_ROOT
          )
        : await $`forge create ${solFile}:${contractName} --broadcast --unlocked --from 0x976EA74026E726554dB657fA54763abd0C3a0aa9 --json --rpc-url http://localhost:${this.config.anvilPort} --optimize --optimizer-runs 200 --out ${FORGE_OUT_DIR} --cache-path ${FORGE_CACHE_DIR}`
            .cwd(CONTRACTS_ROOT)
            .quiet();
    }

    const output = result.stdout.toString();
    const errorOutput = result.stderr.toString();

    logger.debug(`Deployment exit code: ${result.exitCode}`);
    logger.debug(`Deployment stdout: ${output}`);
    logger.debug(`Deployment stderr: ${errorOutput}`);

    if (result.exitCode !== 0) {
      throw new Error(
        `Failed to deploy ${contractName}: ${errorOutput || output || "Unknown error"}`
      );
    }

    // Check if output looks like bytecode instead of JSON
    if (output.startsWith("0x") && !output.includes("{")) {
      logger.warn(
        `Received bytecode instead of JSON for ${contractName}. This might indicate a compilation issue.`
      );
      logger.debug(`Raw output: ${output.slice(0, 200)}...`);
      throw new Error(
        `Deployment failed - received bytecode instead of deployment JSON for ${contractName}`
      );
    }

    let deployData;
    try {
      deployData = JSON.parse(output);
    } catch (error) {
      logger.error(`Error parsing JSON output for ${contractName}`);
      logger.error(`Raw output: ${output}`);
      throw new Error(
        `Error parsing deployment output for ${contractName}: ${output.slice(0, 500)}...`
      );
    }

    const deployedAddress = deployData.deployedTo;
    if (!deployedAddress) {
      logger.error(`Deployment data for ${contractName}:`, deployData);
      throw new Error(
        `Unable to get deployed address for ${contractName}. Full output: ${JSON.stringify(deployData, null, 2)}`
      );
    }

    logger.debug(`${contractName} deployed to: ${deployedAddress}`);
    return deployedAddress;
  }

  async getStorageLayout(
    solFile: string,
    contractName: string,
    deployedAddress: string
  ): Promise<Record<string, string>> {
    logger.debug(`Getting storage layout for ${contractName}...`);

    // Get storage layout from contract
    const layoutResult = isDebugEnabled()
      ? await $`forge inspect ${solFile}:${contractName} storageLayout --force --json --out ${FORGE_OUT_DIR} --cache-path ${FORGE_CACHE_DIR}`.cwd(
          CONTRACTS_ROOT
        )
      : await $`forge inspect ${solFile}:${contractName} storageLayout --force --json --out ${FORGE_OUT_DIR} --cache-path ${FORGE_CACHE_DIR}`
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
      logger.warn(`No storage slots found for ${contractName}`);
      return storage;
    }

    // Process storage slots
    for (const slot of storageLayout.storage) {
      try {
        const slotResult = isDebugEnabled()
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
          logger.warn(
            `Error reading storage slot ${slot.slot} for ${contractName}`
          );
        }
      } catch (error) {
        logger.warn(
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
    logger.debug(`Getting deployed bytecode for ${contractName}...`);

    const result = isDebugEnabled()
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
    logger.info("Initializing genesis allocation file...");

    // Create output directories
    await $`mkdir -p ${FORGE_OUT_DIR}`.quiet();
    await $`mkdir -p ${OUTPUT_DIR}`.quiet();
    logger.debug(`Created forge output directory: ${FORGE_OUT_DIR}`);
    logger.debug(`Created output directory: ${OUTPUT_DIR}`);

    // Remove existing file if it exists
    const allocFile = Bun.file(ALL_ALLOCATIONS_FILE);
    if (await allocFile.exists()) {
      await $`rm -f ${ALL_ALLOCATIONS_FILE}`.quiet();
      logger.debug("Removed existing genesis file");
    }

    // Initialize empty JSON object
    await Bun.write(ALL_ALLOCATIONS_FILE, "{}");
    logger.info("Genesis allocation file initialized");
  }

  async addToGenesis(
    contractName: string,
    targetAddress: string,
    bytecode: string,
    storage: Record<string, string>
  ): Promise<void> {
    logger.debug(`Adding ${contractName} to genesis allocation...`);

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
    logger.debug(`Added ${contractName} to genesis allocation`);
  }

  async processContract(
    contractName: keyof typeof CONTRACT_ADDRESSES,
    totalContracts: number
  ): Promise<void> {
    const targetAddress = CONTRACT_ADDRESSES[contractName];
    if (!targetAddress) {
      logger.debug(`Skipping ${contractName}: Not in CONTRACT_ADDRESSES list`);
      this.skippedCount++;
      return;
    }

    // Show progress
    const progressPct = Math.floor(
      ((this.processedCount + this.failedCount + this.skippedCount) * 100) /
        totalContracts
    );
    logger.debug(`[${progressPct}%] Processing ${contractName}...`);

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
      logger.debug(`Successfully processed ${contractName}`);

      // Show concise progress
      const totalProcessed = this.processedCount + this.failedCount;
      logger.info(
        `Progress: ${totalProcessed}/${Object.keys(CONTRACT_ADDRESSES).length} contracts completed`
      );
    } catch (error) {
      this.failedCount++;
      logger.error(`Failed to process ${contractName}: ${error}`);
      logger.debug(`${error as Error}.message`);
      throw error;
    }
  }

  async processAllContracts(): Promise<void> {
    logger.info("Processing all contracts...");

    const contractNames = Object.keys(CONTRACT_ADDRESSES);
    const totalContracts = contractNames.length;
    logger.info(`Processing ${totalContracts} contracts...`);

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
        logger.error(`Error processing ${contractName}: ${error}`);
      }
    }

    if (this.processedCount === 0) {
      throw new Error("No contracts were processed successfully");
    }
  }

  async verifyAllContractsProcessed(): Promise<void> {
    logger.info("Verifying all contracts were processed...");

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

    logger.debug(`Expected contracts: ${expectedTotal}`);
    logger.debug(`Processed contracts: ${genesisAddresses.length}`);

    if (missingContracts.length > 0) {
      logger.error(
        "The following contracts are missing from the genesis file:"
      );
      for (const contract of missingContracts) {
        logger.error(`  - ${contract}`);
      }
      throw new Error(
        "Genesis generation incomplete - not all contracts were processed"
      );
    }

    logger.info(`All ${expectedTotal} contracts were successfully processed!`);
  }

  async generateFinalGenesis(): Promise<void> {
    logger.info("Generating final genesis.json file...");

    // Check if allocations exist
    const allocFile = Bun.file(ALL_ALLOCATIONS_FILE);
    if (!(await allocFile.exists())) {
      throw new Error(`Genesis allocations not found: ${ALL_ALLOCATIONS_FILE}`);
    }

    try {
      // Read allocations
      const contractAllocations = await allocFile.json();

      logger.debug(
        `Contract allocations: ${Object.keys(contractAllocations).length}`
      );

      // Read genesis template
      const templateFile = Bun.file(GENESIS_TEMPLATE_FILE);
      if (!(await templateFile.exists())) {
        throw new Error(`Genesis template not found: ${GENESIS_TEMPLATE_FILE}`);
      }
      const template = await templateFile.json();

      // Merge allocations into template
      const finalGenesis = {
        ...template,
        alloc: {
          ...(template.alloc || {}),
          ...contractAllocations,
        },
      };

      // Ensure output directory exists
      await $`mkdir -p ${CONTRACTS_ROOT}/genesis`.quiet();

      // Write complete genesis file
      await Bun.write(
        CONTRACTS_GENESIS_FILE,
        JSON.stringify(finalGenesis, null, 2)
      );

      logger.info(`Complete genesis written to: ${CONTRACTS_GENESIS_FILE}`);
      logger.info(
        `Total allocations: ${Object.keys(finalGenesis.alloc).length} (${
          Object.keys(template.alloc || {}).length
        } from template + ${Object.keys(contractAllocations).length} contracts)`
      );

      // Verify the written file can be read back
      const verificationFile = Bun.file(CONTRACTS_GENESIS_FILE);
      const verification = await verificationFile.json();
      if (!verification || !verification.config || !verification.alloc) {
        throw new Error("Written genesis file is invalid");
      }
      logger.debug("Genesis file verification passed");
    } catch (error) {
      throw new Error(`Failed to generate final genesis file: ${error}`);
    }
  }

  async cleanupForgeOutput(): Promise<void> {
    logger.info("Cleaning up forge output directory...");

    try {
      const forgeDir = Bun.file(FORGE_OUT_DIR);
      if (await forgeDir.exists()) {
        await $`rm -rf ${FORGE_OUT_DIR}`.quiet();
        logger.debug(`Removed forge output directory: ${FORGE_OUT_DIR}`);
      }
    } catch (error) {
      logger.warn(`Failed to cleanup forge output directory: ${error}`);
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
  logger.info(`
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
      // Note: SettleMint SDK logger level is set at creation time
      // Use LOG_LEVEL or SETTLEMINT_LOG_LEVEL env var instead
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
        // Note: SettleMint SDK logger level is set at creation time
        // Use LOG_LEVEL=debug env var instead
        break;

      case "-q":
      case "--quiet":
        // Note: SettleMint SDK logger level is set at creation time
        // Use LOG_LEVEL=error env var instead
        break;

      case "-p":
      case "--port":
        const port = parseInt(args[++i] ?? "", 10);
        if (isNaN(port)) {
          logger.error("Option --port requires a valid port number");
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
        logger.error(`Unknown option: ${arg}`);
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

  logger.info("Starting Genesis Output Generator...");
  logger.info(`Contracts root: ${CONTRACTS_ROOT}`);
  logger.info(`Anvil port: ${config.anvilPort}`);

  // Check prerequisites
  logger.info("Checking prerequisites...");

  // Check if forge is available
  try {
    const forgeResult = isDebugEnabled()
      ? await $`forge --version`.cwd(CONTRACTS_ROOT)
      : await $`forge --version`.cwd(CONTRACTS_ROOT).quiet();
    logger.debug(`Forge version: ${forgeResult.stdout}`);
  } catch (error) {
    throw new Error("Forge not found. Please install Foundry.");
  }

  // Check if anvil is available
  try {
    const anvilResult = isDebugEnabled()
      ? await $`anvil --version`
      : await $`anvil --version`.quiet();
    logger.debug(`Anvil version: ${anvilResult.stdout}`);
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
    logger.info("Genesis generation completed successfully!");
    logger.info(
      `Processing summary: ${stats.processed} processed, ${stats.skipped} skipped, ${stats.failed} failed`
    );
    logger.info(`Contract allocations written to: ${ALL_ALLOCATIONS_FILE}`);
    logger.info(`Final genesis file written to: ${CONTRACTS_GENESIS_FILE}`);

    // Show output if requested
    if (config.showOutput) {
      logger.info("=== FINAL GENESIS OUTPUT ===");
      const genesisFile = Bun.file(CONTRACTS_GENESIS_FILE);
      const genesisContent = await genesisFile.text();
      logger.info(genesisContent);
    }
  } catch (error) {
    // Cleanup on error
    try {
      await generator.cleanupForgeOutput();
      await generator.stopAnvil();
    } catch (cleanupError) {
      logger.warn(`Failed to cleanup on error: ${cleanupError}`);
    }

    logger.error(`Genesis generation failed: ${error}`);
    process.exit(1);
  }
}

// Global generator reference for cleanup
let globalGenerator: GenesisGenerator | null = null;

// Handle process interruption
process.on("SIGINT", async () => {
  logger.info("Received SIGINT, cleaning up...");
  if (globalGenerator) {
    try {
      await globalGenerator.stopAnvil();
    } catch (error) {
      logger.warn(`Error during cleanup: ${error}`);
    }
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, cleaning up...");
  if (globalGenerator) {
    try {
      await globalGenerator.stopAnvil();
    } catch (error) {
      logger.warn(`Error during cleanup: ${error}`);
    }
  }
  process.exit(0);
});

// Run the script
if (import.meta.main) {
  main().catch((error) => {
    logger.error("Unhandled error:", error);
    process.exit(1);
  });
}
