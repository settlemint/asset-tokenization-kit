import { Address, type Hex } from "viem";
import { ATKOnboardingContracts } from "../../services/deployer";
import { waitForEvent } from "../../utils/wait-for-event";
import { Asset } from "../asset";

export class TimeboundAirdrop {
  public address!: Address;

  constructor(
    public readonly name: string,
    public readonly token: Asset<any>,
    public readonly root: Hex,
    public readonly owner: Address,
    public readonly startTime: bigint,
    public readonly endTime: bigint,
    public readonly contract: ATKOnboardingContracts["timeboundAirdropFactory"]
  ) {}

  public async waitUntilDeployed(transactionHash: Hex) {
    const eventArgs = await waitForEvent({
      transactionHash,
      contract: this.contract,
      eventName: "ATKTimeBoundAirdropCreated",
    });

    const { airdropAddress, creator } = eventArgs as {
      airdropAddress: Address;
      creator: Address;
    };

    this.address = airdropAddress;

    console.log(`[TimeboundAirdrop] ${this.name} created`);
    console.log(`[TimeboundAirdrop] ${this.name} address: ${this.address}`);
    console.log(`[TimeboundAirdrop] ${this.name} token: ${this.token.address}`);
    console.log(`[TimeboundAirdrop] ${this.name} root: ${this.root}`);
    console.log(`[TimeboundAirdrop] ${this.name} owner: ${this.owner}`);
    console.log(`[TimeboundAirdrop] ${this.name} startTime: ${this.startTime}`);
    console.log(`[TimeboundAirdrop] ${this.name} endTime: ${this.endTime}`);
    console.log(`[TimeboundAirdrop] ${this.name} creator: ${creator}`);
  }
}
