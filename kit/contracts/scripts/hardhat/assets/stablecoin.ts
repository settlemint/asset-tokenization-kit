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
import { issueCollateralClaim } from "./actions/issue-collateral-claim";
import { issueIsinClaim } from "./actions/issue-isin-claim";
import { mint } from "./actions/mint";
import { transfer } from "./actions/transfer";

export const createStablecoin = async () => {
  console.log("\n=== Creating stablecoin... ===\n");

  const stablecoinFactory =
    smartProtocolDeployer.getStablecoinFactoryContract();

  const transactionHash = await stablecoinFactory.write.createStableCoin([
    "Tether",
    "USDT",
    6,
    [
      topicManager.getTopicId(SMARTTopic.kyc),
      topicManager.getTopicId(SMARTTopic.aml),
    ],
    [], // TODO: fill in with the setup for ATK
  ]);

  const { tokenAddress, tokenIdentity, accessManager } = (await waitForEvent({
    transactionHash,
    contract: stablecoinFactory,
    eventName: "TokenAssetCreated",
  })) as {
    sender: Address;
    tokenAddress: Address;
    tokenIdentity: Address;
    accessManager: Address;
  };

  if (tokenAddress && tokenIdentity && accessManager) {
    console.log("[Stablecoin] address:", tokenAddress);
    console.log("[Stablecoin] identity:", tokenIdentity);
    console.log("[Stablecoin] access manager:", accessManager);

    // needs to be done so that he can add the claims
    await grantRole(accessManager, owner.address, SMARTRoles.claimManagerRole);
    // issue isin claim
    await issueIsinClaim(tokenIdentity, "JP3902900004");

    // Update collateral
    const now = new Date();
    const oneYearFromNow = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate(),
    );
    await issueCollateralClaim(tokenIdentity, 1000n, 6, oneYearFromNow);

    // needs supply management role to mint
    await grantRole(
      accessManager,
      owner.address,
      SMARTRoles.supplyManagementRole,
    );

    await mint(tokenAddress, investorA, 1000n, 6);
    await transfer(tokenAddress, investorA, investorB, 500n, 6);
    await burn(tokenAddress, investorB, 250n, 6);

    // TODO: execute all other functions of the stablecoin

    return tokenAddress;
  }

  throw new Error("Failed to create deposit");
};
