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
import { issueCollateralClaim } from "./actions/issue-collateral-claim";
import { issueIsinClaim } from "./actions/issue-isin-claim";
import { mint } from "./actions/mint";
import { transfer } from "./actions/transfer";

export const createDeposit = async () => {
  console.log("\n=== Creating deposit... ===\n");

  const depositFactory = smartProtocolDeployer.getDepositFactoryContract();

  const transactionHash = await depositFactory.write.createDeposit([
    "Euro Deposits",
    "EURD",
    6,
    [
      topicManager.getTopicId(SMARTTopic.kyc),
      topicManager.getTopicId(SMARTTopic.aml),
    ],
    [], // TODO: fill in with the setup for ATK
  ]);

  const { tokenAddress, tokenIdentity, accessManager } = (await waitForEvent({
    transactionHash,
    contract: depositFactory,
    eventName: "TokenAssetCreated",
  })) as {
    sender: Address;
    tokenAddress: Address;
    tokenIdentity: Address;
    accessManager: Address;
  };

  if (tokenAddress && tokenIdentity && accessManager) {
    console.log("[Deposit] address:", tokenAddress);
    console.log("[Deposit] identity:", tokenIdentity);
    console.log("[Deposit] access manager:", accessManager);

    // needs to be done so that he can add the claims
    await grantRole(accessManager, owner.address, SMARTRoles.claimManagerRole);
    // issue isin claim
    await issueIsinClaim(tokenIdentity, "US1234567890");

    // Update collateral
    const now = new Date();
    const oneYearFromNow = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate()
    );
    await issueCollateralClaim(tokenIdentity, 1000n, 6, oneYearFromNow);

    // needs supply management role to mint
    await grantRole(
      accessManager,
      owner.address,
      SMARTRoles.supplyManagementRole
    );

    await mint(tokenAddress, investorA, 1000n, 6);
    await transfer(tokenAddress, investorA, investorB, 500n, 6);
    await burn(tokenAddress, investorB, 250n, 6);

    // create some users with identity claims
    // burn

    // TODO: execute all other functions of the deposit

    return tokenAddress;
  }

  throw new Error("Failed to create deposit");
};
