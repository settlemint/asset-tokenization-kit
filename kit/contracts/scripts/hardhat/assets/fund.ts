import type { Address } from "viem";

import { owner } from "../actors/owner";
import { smartProtocolDeployer } from "../services/deployer";
import { waitForEvent } from "../utils/wait-for-event";

import { investorA, investorB } from "../actors/investors";
import { SMARTRoles } from "../constants/roles";

import { SMARTTopic } from "../constants/topics";
import { topicManager } from "../services/topic-manager";
import { Asset } from "../types/asset";
import { burn } from "./actions/burn";
import { grantRole } from "./actions/grant-role";
import { issueAssetClassificationClaim } from "./actions/issue-asset-classification-claim";
import { issueIsinClaim } from "./actions/issue-isin-claim";
import { mint } from "./actions/mint";
import { transfer } from "./actions/transfer";

export const createFund = async () => {
  console.log("\n=== Creating fund... ===\n");

  const fundFactory = smartProtocolDeployer.getFundFactoryContract();

  const transactionHash = await fundFactory.write.createFund([
    "Bens Bugs",
    "BB",
    8,
    20,
    [
      topicManager.getTopicId(SMARTTopic.kyc),
      topicManager.getTopicId(SMARTTopic.aml),
    ],
    [], // TODO: fill in with the setup for ATK
  ]);

  const { tokenAddress, tokenIdentity, accessManager } = (await waitForEvent({
    transactionHash,
    contract: fundFactory,
    eventName: "TokenAssetCreated",
  })) as {
    sender: Address;
    tokenAddress: Address;
    tokenIdentity: Address;
    accessManager: Address;
  };

  if (tokenAddress && tokenIdentity && accessManager) {
    const fund = new Asset(
      "Bens Bugs",
      "BB",
      tokenAddress,
      tokenIdentity,
      accessManager
    );

    // needs to be done so that he can add the claims
    await grantRole(fund, owner, SMARTRoles.claimManagerRole);
    // issue isin claim
    await issueIsinClaim(fund, "FR0000120271");
    // issue asset classification claim
    await issueAssetClassificationClaim(fund, "Class A", "Category A");

    // needs supply management role to mint
    await grantRole(fund, owner, SMARTRoles.supplyManagementRole);

    await mint(fund, investorA, 10n, 8);
    await transfer(fund, investorA, investorB, 5n, 8);
    await burn(fund, investorB, 2n, 8);

    // TODO: execute all other functions of the fund

    return fund;
  }

  throw new Error("Failed to create deposit");
};
