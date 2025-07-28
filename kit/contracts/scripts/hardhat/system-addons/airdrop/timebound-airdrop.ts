import { owner } from "../../constants/actors";
import { AirdropMerkleTree } from "../../entities/airdrop/merkle-tree";
import { TimeBoundAirdrop } from "../../entities/airdrop/timebound-airdrop";
import { Asset } from "../../entities/asset";
import { atkDeployer } from "../../services/deployer";
import { getAnvilTimeSeconds } from "../../utils/anvil";
import { grantAirdropFactoryPermissions } from "./utils/permissions";

export const createTimeBoundAirdrop = async (
  asset: Asset<any>,
  merkleTree: AirdropMerkleTree
) => {
  console.log("\n=== Creating time-bound airdrop... ===\n");

  // Grant necessary permissions to the timebound airdrop factory
  await grantAirdropFactoryPermissions("timeBoundAirdropFactory");

  const timeBoundAirdropFactory =
    atkDeployer.getTimeBoundAirdropFactoryContract();
  const anvilTimeSeconds = await getAnvilTimeSeconds(owner);
  const startTime = BigInt(anvilTimeSeconds + 30 * 60); // 30 minutes in the future
  const endTime = BigInt(anvilTimeSeconds + 60 * 24 * 60 * 60); // 60 days in the future

  const timeBoundAirdrop = new TimeBoundAirdrop(
    "Test Time-Bound Airdrop",
    asset,
    merkleTree.getRoot(),
    owner.address,
    startTime,
    endTime,
    timeBoundAirdropFactory
  );

  const transactionHash = await timeBoundAirdropFactory.write.create([
    timeBoundAirdrop.name,
    timeBoundAirdrop.token.address,
    timeBoundAirdrop.root,
    timeBoundAirdrop.owner,
    timeBoundAirdrop.startTime,
    timeBoundAirdrop.endTime,
  ]);

  await timeBoundAirdrop.waitUntilDeployed(transactionHash);

  return timeBoundAirdrop;
};
