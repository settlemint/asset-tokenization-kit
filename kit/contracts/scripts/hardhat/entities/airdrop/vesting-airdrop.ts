import hre from 'hardhat';
import type { Address, Hex } from 'viem';
import ATKLinearVestingStrategy from '../../../../ignition/modules/atk/addons/airdrop/linear-vesting-strategy';
import {
  type ATKOnboardingContracts,
  atkDeployer,
} from '../../services/deployer';
import { waitForEvent } from '../../utils/wait-for-event';
import type { Asset } from '../asset';

export class VestingAirdrop {
  public address!: Address;

  constructor(
    public readonly name: string,
    public readonly token: Asset<any>,
    public readonly root: Hex,
    public readonly owner: Address,
    public readonly vestingStrategy: Address,
    public readonly initializationDeadline: bigint,
    public readonly contract: ATKOnboardingContracts['vestingAirdropFactory']
  ) {}

  public async waitUntilDeployed(transactionHash: Hex) {
    const eventArgs = await waitForEvent({
      transactionHash,
      contract: this.contract,
      eventName: 'ATKVestingAirdropCreated',
    });

    const {
      airdrop,
      name,
      token,
      root,
      owner,
      vestingStrategy,
      initializationDeadline,
    } = eventArgs as {
      airdrop: Address;
      name: string;
      token: Address;
      root: Hex;
      owner: Address;
      vestingStrategy: Address;
      initializationDeadline: bigint;
    };

    this.address = airdrop;

    console.log(`[VestingAirdrop] ${this.name} created`);
    console.log(`[VestingAirdrop] ${this.name} address: ${this.address}`);
    console.log(`[VestingAirdrop] ${this.name} token: ${token}`);
    console.log(`[VestingAirdrop] ${this.name} root: ${root}`);
    console.log(`[VestingAirdrop] ${this.name} owner: ${owner}`);
    console.log(
      `[VestingAirdrop] ${this.name} vestingStrategy: ${vestingStrategy}`
    );
    console.log(
      `[VestingAirdrop] ${this.name} initializationDeadline: ${initializationDeadline}`
    );
  }

  static async deployLinearVestingStrategy({
    vestingDuration,
    cliffDuration,
  }: {
    vestingDuration: number;
    cliffDuration: number;
  }) {
    const { atkLinearVestingStrategy } = (await hre.ignition.deploy(
      ATKLinearVestingStrategy,
      {
        deploymentId: atkDeployer.getDeploymentId(),
        parameters: {
          ATKLinearVestingStrategy: {
            vestingDuration,
            cliffDuration,
          },
        },
      }
    )) as { atkLinearVestingStrategy: { address: Address } };

    return atkLinearVestingStrategy.address;
  }
}
