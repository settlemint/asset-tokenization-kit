import { owner } from "../../entities/actors/owner";
import { AirdropMerkleTree } from "../../entities/airdrop/merkle-tree";
import { TimeboundAirdrop } from "../../entities/airdrop/timebound-airdrop";
import { Asset } from "../../entities/asset";
import { atkDeployer } from "../../services/deployer";
import { getAnvilTimeSeconds } from "../../utils/anvil";

export const createTimeboundAirdrop = async (
  asset: Asset<any>,
  merkleTree: AirdropMerkleTree
) => {
  console.log("\n=== Creating timebound airdrop... ===\n");

  const timeBoundAirdropFactory =
    atkDeployer.getTimeboundAirdropFactoryContract();
  const anvilTimeSeconds = await getAnvilTimeSeconds(owner);

  // Set start time to 1 hour from now and end time to 30 days from start
  const startTime = BigInt(anvilTimeSeconds + 60 * 60); // 1 hour from now
  const endTime = BigInt(anvilTimeSeconds + 30 * 24 * 60 * 60 + 60 * 60); // 30 days + 1 hour from now

  const timeboundAirdrop = new TimeboundAirdrop(
    "Test Timebound Airdrop",
    asset,
    merkleTree.getRoot(),
    owner.address,
    startTime,
    endTime,
    timeBoundAirdropFactory
  );

  const transactionHash = await timeBoundAirdropFactory.write.create([
    timeboundAirdrop.name,
    timeboundAirdrop.token.address,
    timeboundAirdrop.root,
    timeboundAirdrop.owner,
    timeboundAirdrop.startTime,
    timeboundAirdrop.endTime,
  ]);

  await timeboundAirdrop.waitUntilDeployed(transactionHash);
  return timeboundAirdrop;
};
