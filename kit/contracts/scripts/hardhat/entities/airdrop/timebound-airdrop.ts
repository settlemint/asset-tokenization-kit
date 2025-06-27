import type { Address, Hex } from 'viem';
import type { ATKOnboardingContracts } from '../../services/deployer';
import { waitForEvent } from '../../utils/wait-for-event';
import type { Asset } from '../asset';

export class TimeBoundAirdrop {
  public address!: Address;

  constructor(
    public readonly name: string,
    public readonly token: Asset<any>,
    public readonly root: Hex,
    public readonly owner: Address,
    public readonly startTime: bigint,
    public readonly endTime: bigint,
    public readonly contract: ATKOnboardingContracts['timeBoundAirdropFactory']
  ) {}

  public async waitUntilDeployed(transactionHash: Hex) {
    const eventArgs = await waitForEvent({
      transactionHash,
      contract: this.contract,
      eventName: 'ATKTimeBoundAirdropCreated',
    });

    const { airdropAddress, creator } = eventArgs as {
      airdropAddress: Address;
      creator: Address;
    };

    this.address = airdropAddress;

    console.log(`[TimeBoundAirdrop] ${this.name} created`);
    console.log(`[TimeBoundAirdrop] ${this.name} address: ${this.address}`);
    console.log(`[TimeBoundAirdrop] ${this.name} token: ${this.token.address}`);
    console.log(`[TimeBoundAirdrop] ${this.name} root: ${this.root}`);
    console.log(`[TimeBoundAirdrop] ${this.name} owner: ${this.owner}`);
    console.log(`[TimeBoundAirdrop] ${this.name} startTime: ${this.startTime}`);
    console.log(`[TimeBoundAirdrop] ${this.name} endTime: ${this.endTime}`);
    console.log(`[TimeBoundAirdrop] ${this.name} creator: ${creator}`);
  }
}
