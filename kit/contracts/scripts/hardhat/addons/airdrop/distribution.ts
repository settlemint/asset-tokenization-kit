import { parseEther } from "viem";
import { claimIssuer } from "../../entities/actors/claim-issuer";
import {
  frozenInvestor,
  investorA,
  investorB,
} from "../../entities/actors/investors";
import { owner } from "../../entities/actors/owner";
import {
  AirdropDistributionList,
  AirdropMerkleTree,
} from "../../entities/airdrop/merkle-tree";

// Create airdrop distribution
export const distribution: AirdropDistributionList = [
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
export const merkleTree = new AirdropMerkleTree(distribution);
export const merkleRoot = merkleTree.getRoot();
