import { Address, type Hex } from "viem";
import {
  SMARTOnboardingContracts,
  type ContractName,
} from "../services/deployer";
import { waitForEvent } from "../utils/wait-for-event";

export class Asset<T extends ContractName> {
  public address!: Address;
  public identity!: Address;
  public accessManager!: Address;

  constructor(
    public readonly name: string,
    public readonly symbol: string,
    public readonly decimals: number,
    public readonly isin: string,
    public readonly contract: SMARTOnboardingContracts[T]
  ) {}

  public async waitUntilDeployed(transactionHash: Hex) {
    const { tokenAddress, tokenIdentity, accessManager } = (await waitForEvent({
      transactionHash,
      contract: this.contract,
      eventName: "TokenAssetCreated",
    })) as {
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
