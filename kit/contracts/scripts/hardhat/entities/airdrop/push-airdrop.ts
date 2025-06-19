import { Address, type Hex } from "viem";
import { ATKOnboardingContracts } from "../../services/deployer";
import { waitForEvent } from "../../utils/wait-for-event";
import { Asset } from "../asset";

export class PushAirdrop {
  public address!: Address;

  constructor(
    public readonly name: string,
    public readonly token: Asset<any>,
    public readonly root: Hex,
    public readonly owner: Address,
    public readonly distributionCap: bigint,
    public readonly contract: ATKOnboardingContracts["pushAirdropFactory"]
  ) {}

  public async waitUntilDeployed(transactionHash: Hex) {
    const eventArgs = await waitForEvent({
      transactionHash,
      contract: this.contract,
      eventName: "ATKPushAirdropCreated",
    });

    const { airdropAddress, creator } = eventArgs as {
      airdropAddress: Address;
      creator: Address;
    };

    this.address = airdropAddress;

    console.log(`[PushAirdrop] ${this.name} created`);
    console.log(`[PushAirdrop] ${this.name} address: ${this.address}`);
    console.log(`[PushAirdrop] ${this.name} token: ${this.token.address}`);
    console.log(`[PushAirdrop] ${this.name} root: ${this.root}`);
    console.log(`[PushAirdrop] ${this.name} owner: ${this.owner}`);
    console.log(
      `[PushAirdrop] ${this.name} distributionCap: ${this.distributionCap}`
    );
    console.log(`[PushAirdrop] ${this.name} creator: ${creator}`);
  }
}
