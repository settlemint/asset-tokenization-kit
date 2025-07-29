import { parseEther } from "viem";
import { owner } from "../../constants/actors";
import { AirdropMerkleTree } from "../../entities/airdrop/merkle-tree";
import { PushAirdrop } from "../../entities/airdrop/push-airdrop";
import { Asset } from "../../entities/asset";
import { atkDeployer } from "../../services/deployer";
import { grantAirdropFactoryPermissions } from "./utils/permissions";

export const createPushAirdrop = async (
  asset: Asset<any>,
  merkleTree: AirdropMerkleTree
) => {
  console.log("\n=== Creating push airdrop... ===\n");

  // Grant necessary permissions to the push airdrop factory
  await grantAirdropFactoryPermissions("pushAirdropFactory");

  const pushAirdropFactory = atkDeployer.getPushAirdropFactoryContract();

  // Set a distribution cap of 10,000 tokens for this example
  const distributionCap = parseEther("10000");

  const pushAirdrop = new PushAirdrop(
    "Test Push Airdrop",
    asset,
    merkleTree.getRoot(),
    owner.address,
    distributionCap,
    pushAirdropFactory
  );

  const transactionHash = await pushAirdropFactory.write.create([
    pushAirdrop.name,
    pushAirdrop.token.address,
    pushAirdrop.root,
    pushAirdrop.owner,
    pushAirdrop.distributionCap, // Add the missing distributionCap parameter
  ]);

  await pushAirdrop.waitUntilDeployed(transactionHash);

  return pushAirdrop;
};
