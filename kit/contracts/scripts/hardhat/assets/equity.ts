import type { Address } from "viem";

import { investorA, investorB } from "../actors/investors";
import { owner } from "../actors/owner";
import { SMARTRoles } from "../constants/roles";
import { SMARTTopic } from "../constants/topics";
import { smartProtocolDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { waitForEvent } from "../utils/wait-for-event";
import { burn } from "./actions/burn";
import { grantRole } from "./actions/grant-role";
import { issueAssetClassificationClaim } from "./actions/issue-asset-classification-claim";
import { issueIsinClaim } from "./actions/issue-isin-claim";
import { mint } from "./actions/mint";
import { transfer } from "./actions/transfer";

export const createEquity = async () => {
  console.log("\n=== Creating equity... ===\n");

  const equityFactory = smartProtocolDeployer.getEquityFactoryContract();

  const transactionHash = await equityFactory.write.createEquity([
    "Apple",
    "AAPL",
    18,
    [
      topicManager.getTopicId(SMARTTopic.kyc),
      topicManager.getTopicId(SMARTTopic.aml),
    ],
    [], // TODO: fill in with the setup for ATK
  ]);

  const { tokenAddress, tokenIdentity, accessManager } = (await waitForEvent({
    transactionHash,
    contract: equityFactory,
    eventName: "TokenAssetCreated",
  })) as {
    sender: Address;
    tokenAddress: Address;
    tokenIdentity: Address;
    accessManager: Address;
  };

  if (tokenAddress && tokenIdentity && accessManager) {
    console.log("[Equity] address:", tokenAddress);
    console.log("[Equity] identity:", tokenIdentity);
    console.log("[Equity] access manager:", accessManager);

    // needs to be done so that he can add the claims
    await grantRole(accessManager, owner.address, SMARTRoles.claimManagerRole);
    // issue isin claim
    await issueIsinClaim(tokenIdentity, "DE000BAY0017");
    // issue asset classification claim
    await issueAssetClassificationClaim(tokenIdentity, "Class A", "Category A");

    // needs supply management role to mint
    await grantRole(
      accessManager,
      owner.address,
      SMARTRoles.supplyManagementRole
    );

    await mint(tokenAddress, investorA, 100n, 18);
    await transfer(tokenAddress, investorA, investorB, 50n, 18);
    await burn(tokenAddress, investorB, 25n, 18);

    // TODO: execute all other functions of the equity

    return tokenAddress;
  }

  throw new Error("Failed to create equity");
};
