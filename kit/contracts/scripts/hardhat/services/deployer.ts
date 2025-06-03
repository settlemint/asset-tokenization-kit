import hre from "hardhat";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import type {
  Abi,
  Account,
  Address,
  Chain,
  GetContractReturnType,
  PublicClient,
  Transport,
  WalletClient,
} from "viem";

import SMARTOnboardingModule from "../../../ignition/modules/onboarding";
import { SMARTContracts } from "../constants/contracts";
import { owner } from "../entities/actors/owner";
// --- Utility Imports ---

// Type for the keys of CONTRACT_METADATA, e.g., "system" | "compliance" | ...
export type ContractName = keyof Pick<
  typeof SMARTContracts,
  | "system"
  | "compliance"
  | "identityRegistry"
  | "identityRegistryStorage"
  | "trustedIssuersRegistry"
  | "topicSchemeRegistry"
  | "identityFactory"
  | "bondFactory"
  | "depositFactory"
  | "equityFactory"
  | "fundFactory"
  | "stablecoinFactory"
  | "countryAllowListModule"
  | "countryBlockListModule"
>;

// Helper type for Viem contract instances
export type ViemContract<
  TAbi extends Abi,
  TClient extends {
    public: PublicClient;
    wallet: WalletClient<Transport, Chain, Account>;
  },
> = GetContractReturnType<TAbi, TClient>;

/**
 * Defines the structure for the contracts deployed by SMARTOnboardingModule,
 * typed with Viem for write operations (includes WalletClient).
 */
export type SMARTOnboardingContracts = {
  [K in ContractName]: ViemContract<
    (typeof SMARTContracts)[K], // Access ABI by key
    { public: PublicClient; wallet: WalletClient<Transport, Chain, Account> }
  >;
};

// Type for storing deployed contract addresses
type DeployedContractAddresses = {
  [K in ContractName]: { address: Address };
};

/**
 * Configuration options for the SmartProtocolDeployer
 */
export interface DeployerOptions {
  /** Whether to reset (clear) existing deployment before deploying */
  reset?: boolean;
  /** Custom deployment ID to use instead of default */
  deploymentId?: string;
  /** Whether to display deployment UI */
  displayUi?: boolean;
}

/**
 * A singleton class to manage the deployment and access of SMART Protocol contracts.
 */
export class SmartProtocolDeployer {
  private _deployedContractAddresses: DeployedContractAddresses | undefined;
  private _deploymentId: string;

  public constructor() {
    this._deployedContractAddresses = undefined;
    this._deploymentId = "smart-protocol-local"; // Default deployment ID
  }

  /**
   * Clears the deployment folder for the given deployment ID
   * @param deploymentId - The deployment ID to clear
   */
  private clearDeployment(deploymentId: string): void {
    const deploymentPath = join(
      hre.config.paths?.ignition || "ignition",
      "deployments",
      deploymentId
    );

    if (existsSync(deploymentPath)) {
      console.log(`🧹 Clearing existing deployment: ${deploymentPath}`);
      rmSync(deploymentPath, { recursive: true, force: true });
      console.log("✅ Deployment cleared successfully");
    } else {
      console.log(`ℹ️ No existing deployment found at: ${deploymentPath}`);
    }
  }

  /**
   * Deploys the SMARTOnboardingModule contracts using Hardhat Ignition.
   * Stores the Viem-typed contract instances internally.
   * This method should only be called once unless reset is used.
   */
  public async setUp(options: DeployerOptions = {}): Promise<void> {
    const { reset = false, deploymentId, displayUi = false } = options;

    // Set deployment ID
    if (deploymentId) {
      this._deploymentId = deploymentId;
    }

    // Handle reset functionality
    if (reset) {
      console.log("🔄 Reset flag enabled - clearing existing deployment...");
      this.clearDeployment(this._deploymentId);
      // Also clear internal state
      this._deployedContractAddresses = undefined;
    }

    if (this._deployedContractAddresses && !reset) {
      console.warn(
        "SMARTOnboardingModule has already been deployed. Skipping setup. Use reset option to redeploy."
      );
      return;
    }

    console.log("🚀 Starting deployment of SMARTOnboardingModule...");
    console.log(`📁 Using deployment ID: ${this._deploymentId}`);

    try {
      // 1. Deploy contracts and get their addresses
      const deploymentAddresses = (await hre.ignition.deploy(
        SMARTOnboardingModule,
        {
          deploymentId: this._deploymentId,
          displayUi,
        }
      )) as DeployedContractAddresses;

      // 2. Store deployed addresses
      this._deployedContractAddresses = deploymentAddresses;

      console.log(
        "✅ SMARTOnboardingModule deployed successfully! Contract addresses and default signer initialized."
      );
      console.log(
        `📂 Deployment artifacts stored in: ignition/deployments/${this._deploymentId}`
      );

      if (this._deployedContractAddresses) {
        console.log("📋 Deployed Contract Addresses:");
        for (const [name, contractInfo] of Object.entries(
          this._deployedContractAddresses
        )) {
          if (contractInfo && typeof contractInfo.address === "string") {
            console.log(`  ${name}: ${contractInfo.address}`);
          }
        }
      }
    } catch (error) {
      console.error("❌ Failed to deploy SMARTOnboardingModule:", error);
      throw error; // Re-throw the error to indicate failure
    }
  }

  /**
   * Gets the current deployment ID
   */
  public getDeploymentId(): string {
    return this._deploymentId;
  }

  /**
   * Sets a new deployment ID (useful for switching between different deployments)
   */
  public setDeploymentId(deploymentId: string): void {
    this._deploymentId = deploymentId;
  }

  /**
   * Checks if contracts are currently deployed
   */
  public isDeployed(): boolean {
    return this._deployedContractAddresses !== undefined;
  }

  private getContract<K extends ContractName>(
    // Use ContractName here
    contractName: K,
    explicitWalletClient?: WalletClient<Transport, Chain, Account>
  ): ViemContract<
    (typeof SMARTContracts)[K],
    { public: PublicClient; wallet: WalletClient<Transport, Chain, Account> }
  > {
    if (!this._deployedContractAddresses) {
      throw new Error(
        "Contracts not deployed. Call setUp() before accessing contracts."
      );
    }

    const contractInfo = this._deployedContractAddresses[contractName];
    if (!contractInfo?.address) {
      throw new Error(
        `Contract "${String(
          contractName
        )}" address not found in deployment results.`
      );
    }

    return owner.getContractInstance({
      address: contractInfo.address,
      abi: SMARTContracts[contractName],
    });
  }

  public getContractAddress(contractName: ContractName): Address {
    if (!this._deployedContractAddresses) {
      throw new Error(
        "Contracts not deployed. Call setUp() before accessing contracts."
      );
    }

    return this._deployedContractAddresses[contractName]?.address;
  }

  // --- Unified Contract Accessor Methods ---

  public getSystemContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["system"] {
    return this.getContract("system", walletClient);
  }

  public getComplianceContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["compliance"] {
    return this.getContract("compliance", walletClient);
  }

  public getIdentityRegistryContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["identityRegistry"] {
    return this.getContract("identityRegistry", walletClient);
  }

  public getIdentityRegistryStorageContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["identityRegistryStorage"] {
    return this.getContract("identityRegistryStorage", walletClient);
  }

  public getTrustedIssuersRegistryContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["trustedIssuersRegistry"] {
    return this.getContract("trustedIssuersRegistry", walletClient);
  }

  public getTopicSchemeRegistryContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["topicSchemeRegistry"] {
    return this.getContract("topicSchemeRegistry", walletClient);
  }

  public getIdentityFactoryContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["identityFactory"] {
    return this.getContract("identityFactory", walletClient);
  }

  public getBondFactoryContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["bondFactory"] {
    return this.getContract("bondFactory", walletClient);
  }

  public getDepositFactoryContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["depositFactory"] {
    return this.getContract("depositFactory", walletClient);
  }

  public getEquityFactoryContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["equityFactory"] {
    return this.getContract("equityFactory", walletClient);
  }

  public getFundFactoryContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["fundFactory"] {
    return this.getContract("fundFactory", walletClient);
  }

  public getStablecoinFactoryContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["stablecoinFactory"] {
    return this.getContract("stablecoinFactory", walletClient);
  }

  public getCountryAllowListModuleContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["countryAllowListModule"] {
    return this.getContract("countryAllowListModule", walletClient);
  }

  public getCountryBlockListModuleContract(
    walletClient?: WalletClient<Transport, Chain, Account>
  ): SMARTOnboardingContracts["countryBlockListModule"] {
    return this.getContract("countryBlockListModule", walletClient);
  }
}

export const smartProtocolDeployer = new SmartProtocolDeployer();
