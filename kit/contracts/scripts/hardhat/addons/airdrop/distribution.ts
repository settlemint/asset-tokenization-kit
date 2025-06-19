import { parseEther, type Address } from "viem";
import { AirdropDistributionList } from "../../entities/airdrop/merkle-tree";

// Create airdrop distribution
export const createDistribution = ({
  ownerAddress,
  investorAAddress,
  investorBAddress,
  frozenInvestorAddress,
  claimIssuerAddress,
}: {
  ownerAddress: Address;
  investorAAddress: Address;
  investorBAddress: Address;
  frozenInvestorAddress: Address;
  claimIssuerAddress: Address;
}): AirdropDistributionList => [
  {
    index: 5,
    recipient: ownerAddress, // Include the owner in the distribution
    amount: parseEther("1000"), // 1000 tokens for Owner
  },
  {
    index: 0,
    recipient: investorAAddress,
    amount: parseEther("100"), // 100 tokens for Investor A
  },
  {
    index: 2,
    recipient: investorBAddress,
    amount: parseEther("500"), // 500 tokens for Investor B
  },
  {
    index: 3,
    recipient: frozenInvestorAddress,
    amount: parseEther("75"), // 75 tokens for Frozen Investor
  },
  {
    index: 4,
    recipient: claimIssuerAddress,
    amount: parseEther("300"), // 300 tokens for Claim Issuer
  },
];
