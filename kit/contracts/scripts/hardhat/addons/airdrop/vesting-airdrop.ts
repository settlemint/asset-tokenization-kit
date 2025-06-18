import { atkDeployer } from "../../services/deployer";

import { parseEther } from "viem";
import { claimIssuer } from "../../entities/actors/claim-issuer";
import {
  frozenInvestor,
  investorA,
  investorB,
} from "../../entities/actors/investors";
import { owner } from "../../entities/actors/owner";
import {
  AirdropMerkleTree,
  type AirdropDistributionList,
} from "../../entities/airdrop/merkle-tree";
import { VestingAirdrop } from "../../entities/airdrop/vesting-airdrop";
import { Asset } from "../../entities/asset";
import { getAnvilTimeSeconds } from "../../utils/anvil";

export const createVestingAirdrop = async (asset: Asset<any>) => {
  console.log("\n=== Creating vesting airdrop... ===\n");

  // Create airdrop distribution
  const distribution: AirdropDistributionList = [
    {
      index: 5,
      recipient: owner.address, // Include the owner in the distribution
      amount: parseEther("1000"), // 1000 tokens for Owner
    },
    {
      index: 0,
      recipient: investorA.address,
      amount: parseEther("100"), // 100 tokens for Investor A
    },
    {
      index: 2,
      recipient: investorB.address,
      amount: parseEther("500"), // 500 tokens for Investor B
    },
    {
      index: 3,
      recipient: frozenInvestor.address,
      amount: parseEther("75"), // 75 tokens for Frozen Investor
    },
    {
      index: 4,
      recipient: claimIssuer.address,
      amount: parseEther("300"), // 300 tokens for Claim Issuer
    },
  ];

  // Create merkle tree from the distribution
  const merkleTree = new AirdropMerkleTree(distribution);
  const merkleRoot = merkleTree.getRoot();

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
    merkleRoot,
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
