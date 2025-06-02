import type { Address } from "viem";
import { investorA, investorB } from "../actors/investors";
import { owner } from "../actors/owner";
import { SMARTRoles } from "../constants/roles";

import { SMARTTopic } from "../constants/topics";
import { smartProtocolDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { Asset } from "../types/asset";
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
    const deposit = new Asset(
      "Euro Deposits",
      "EURD",
      tokenAddress,
      tokenIdentity,
      accessManager
    );

    // needs to be done so that he can add the claims
    await grantRole(deposit, owner, SMARTRoles.claimManagerRole);
    // issue isin claim
    await issueIsinClaim(deposit, "US1234567890");

    // Update collateral
    const now = new Date();
    const oneYearFromNow = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate()
    );
    await issueCollateralClaim(deposit, 1000n, 6, oneYearFromNow);

    // needs supply management role to mint
    await grantRole(deposit, owner, SMARTRoles.supplyManagementRole);

    await mint(deposit, investorA, 1000n, 6);
    await transfer(deposit, investorA, investorB, 500n, 6);
    await burn(deposit, investorB, 250n, 6);

    // create some users with identity claims
    // burn

    // TODO: execute all other functions of the deposit

    return deposit;
  }

  throw new Error("Failed to create deposit");
};
