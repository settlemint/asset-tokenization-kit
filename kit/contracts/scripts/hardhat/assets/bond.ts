import { Address, encodeAbiParameters, parseAbiParameters } from "viem";

import { owner } from "../actors/owner";
import { smartProtocolDeployer } from "../services/deployer";
import { waitForEvent } from "../utils/wait-for-event";

import { investorA, investorB } from "../actors/investors";
import { Countries } from "../constants/countries";
import { SMARTRoles } from "../constants/roles";
import { SMARTTopic } from "../constants/topics";
import { topicManager } from "../services/topic-manager";
import { Asset } from "../types/asset";
import { addCountryAllowListComplianceModule } from "./actions/add-country-allow-list-compliance-module";
import { burn } from "./actions/burn";
import { grantRole } from "./actions/grant-role";
import { issueIsinClaim } from "./actions/issue-isin-claim";
import { mint } from "./actions/mint";
import { transfer } from "./actions/transfer";
import { updateRequiredTopics } from "./actions/update-required-topic";

export const createBond = async (depositToken: Asset) => {
  console.log("\n=== Creating bond... ===\n");

  const bondFactory = smartProtocolDeployer.getBondFactoryContract();

  const encodedBlockedCountries = encodeAbiParameters(
    parseAbiParameters("uint16[]"),
    [[Countries.RU]]
  );

  const transactionHash = await bondFactory.write.createBond([
    "Euro Bonds",
    "EURB",
    6,
    BigInt(1000000 * 10 ** 6),
    BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60), // 1 year
    BigInt(123),
    depositToken.address,
    [topicManager.getTopicId(SMARTTopic.kyc)],
    [
      {
        module: smartProtocolDeployer.getContractAddress(
          "countryBlockListModule"
        ),
        params: encodedBlockedCountries,
      },
    ],
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
    const bond = new Asset(
      "Euro Bonds",
      "EURB",
      tokenAddress,
      tokenIdentity,
      accessManager
    );

    // needs to be done so that he can update the topics and compliance modules
    await grantRole(bond, owner, SMARTRoles.tokenGovernanceRole);

    // set extra topic
    await updateRequiredTopics(bond, [SMARTTopic.kyc, SMARTTopic.aml]);

    // add country allow list compliance module
    await addCountryAllowListComplianceModule(bond, [
      Countries.BE,
      Countries.NL,
    ]);

    // needs to be done so that he can add the claims
    await grantRole(bond, owner, SMARTRoles.claimManagerRole);

    // issue isin claim
    await issueIsinClaim(bond, "GB00B1XGHL29");

    // needs supply management role to mint
    await grantRole(bond, owner, SMARTRoles.supplyManagementRole);

    await mint(bond, investorA, 10n, 6);
    await transfer(bond, investorA, investorB, 5n, 6);
    await burn(bond, investorB, 2n, 6);

    // TODO: add yield etc
    // TODO: execute all other functions of the bond

    return bond;
  }

  throw new Error("Failed to create bond");
};
