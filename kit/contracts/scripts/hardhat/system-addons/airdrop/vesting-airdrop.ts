import { atkDeployer } from "../../services/deployer";

import { owner } from "../../entities/actors/owner";
import { AirdropMerkleTree } from "../../entities/airdrop/merkle-tree";
import { VestingAirdrop } from "../../entities/airdrop/vesting-airdrop";
import { Asset } from "../../entities/asset";
import { getAnvilTimeSeconds } from "../../utils/anvil";

export const createVestingAirdrop = async (
  asset: Asset<any>,
  merkleTree: AirdropMerkleTree
) => {
  console.log("\n=== Creating vesting airdrop... ===\n");

  // Create linear vesting strategy
  const linearVestingStrategy =
    await VestingAirdrop.deployLinearVestingStrategy({
      vestingDuration: 365 * 24 * 60 * 60,
      cliffDuration: 90 * 24 * 60 * 60,
    });

  const vestingAirdropFactory = atkDeployer.getVestingAirdropFactoryContract();
  const anvilTimeSeconds = await getAnvilTimeSeconds(owner);
  const vestingAirdrop = new VestingAirdrop(
    "Test Vesting Airdrop",
    asset,
    merkleTree.getRoot(),
    owner.address,
    linearVestingStrategy,
    BigInt(anvilTimeSeconds + 30 * 24 * 60 * 60),
    vestingAirdropFactory
  );

  const transactionHash = await vestingAirdropFactory.write.create([
    vestingAirdrop.name,
    vestingAirdrop.token.address,
    vestingAirdrop.root,
    vestingAirdrop.owner,
    linearVestingStrategy,
    vestingAirdrop.initializationDeadline,
  ]);

  await vestingAirdrop.waitUntilDeployed(transactionHash);
  return vestingAirdrop;
};
