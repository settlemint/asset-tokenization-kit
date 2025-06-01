import type { Address } from "viem";

import { owner } from "../actors/owner";
import { smartProtocolDeployer } from "../services/deployer";
import { waitForEvent } from "../utils/wait-for-event";

import { investorA, investorB } from "../actors/investors";
import { SMARTRoles } from "../constants/roles";

import { SMARTTopic } from "../constants/topics";
import { topicManager } from "../services/topic-manager";
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
    console.log("[Fund] address:", tokenAddress);
    console.log("[Fund] identity:", tokenIdentity);
    console.log("[Fund] access manager:", accessManager);

    // needs to be done so that he can add the claims
    await grantRole(accessManager, owner.address, SMARTRoles.claimManagerRole);
    // issue isin claim
    await issueIsinClaim(tokenIdentity, "FR0000120271");
    // issue asset classification claim
    await issueAssetClassificationClaim(tokenIdentity, "Class A", "Category A");

    // needs supply management role to mint
    await grantRole(
      accessManager,
      owner.address,
      SMARTRoles.supplyManagementRole
    );

    await mint(tokenAddress, investorA, 10n, 8);
    await transfer(tokenAddress, investorA, investorB, 5n, 8);
    await burn(tokenAddress, investorB, 2n, 8);

    // TODO: execute all other functions of the fund

    return tokenAddress;
  }

  throw new Error("Failed to create deposit");
};
