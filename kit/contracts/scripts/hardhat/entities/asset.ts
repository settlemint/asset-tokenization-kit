import { Address, type Hex } from "viem";
import {
  ATKOnboardingContracts,
  type PredeployedContractName,
} from "../services/deployer";
import { waitForEvent } from "../utils/wait-for-event";

export class Asset<T extends PredeployedContractName> {
  public address!: Address;
  public identity!: Address;
  public accessManager!: Address;

  constructor(
    public readonly name: string,
    public readonly symbol: string,
    public readonly decimals: number,
    public readonly isin: string,
    public readonly contract: ATKOnboardingContracts[T]
  ) {}

  public async waitUntilDeployed(transactionHash: Hex) {
    const eventArgs = await waitForEvent({
      transactionHash,
      contract: this.contract as any,
      eventName: "TokenAssetCreated",
    });

    const { tokenAddress, tokenIdentity, accessManager } = eventArgs as {
      tokenAddress: Address;
      tokenIdentity: Address;
      accessManager: Address;
    };

    this.address = tokenAddress;
    this.identity = tokenIdentity;
    this.accessManager = accessManager;

    console.log(`[Asset] ${this.name} (${this.symbol}) created`);
    console.log(`[Asset] ${this.name} address: ${this.address}`);
    console.log(`[Asset] ${this.name} identity: ${this.identity}`);
    console.log(`[Asset] ${this.name} access manager: ${this.accessManager}`);
  }
}
