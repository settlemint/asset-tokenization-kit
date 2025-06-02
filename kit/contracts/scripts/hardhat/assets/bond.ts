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
import { issueIsinClaim } from "./actions/issue-isin-claim";
import { mint } from "./actions/mint";
import { transfer } from "./actions/transfer";

export const createBond = async (depositToken: Address) => {
  console.log("\n=== Creating bond... ===\n");

  const bondFactory = smartProtocolDeployer.getBondFactoryContract();

  const transactionHash = await bondFactory.write.createBond([
    "Euro Bonds",
    "EURB",
    6,
    BigInt(1000000 * 10 ** 6),
    BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60), // 1 year
    BigInt(123),
    depositToken,
    [
      topicManager.getTopicId(SMARTTopic.kyc),
      topicManager.getTopicId(SMARTTopic.aml),
    ],
    [], // TODO: fill in with the setup for ATK
  ]);

  const { tokenAddress, tokenIdentity, accessManager } = (await waitForEvent({
    transactionHash,
    contract: bondFactory,
    eventName: "TokenAssetCreated",
  })) as {
    tokenAddress: Address;
    tokenIdentity: Address;
    accessManager: Address;
  };

  if (tokenAddress && tokenIdentity && accessManager) {
    console.log("[Bond] address:", tokenAddress);
    console.log("[Bond] identity:", tokenIdentity);
    console.log("[Bond] access manager:", accessManager);

    // needs to be done so that he can add the claims
    await grantRole(accessManager, owner.address, SMARTRoles.claimManagerRole);

    // issue isin claim
    await issueIsinClaim(tokenIdentity, "GB00B1XGHL29");

    // needs supply management role to mint
    await grantRole(
      accessManager,
      owner.address,
      SMARTRoles.supplyManagementRole
    );

    await mint(tokenAddress, investorA, 10n, 6);
    await transfer(tokenAddress, investorA, investorB, 5n, 6);
    await burn(tokenAddress, investorB, 2n, 6);

    // TODO: add yield etc
    // TODO: execute all other functions of the bond

    return tokenAddress;
  }

  throw new Error("Failed to create bond");
};
