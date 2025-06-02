import { encodeAbiParameters, parseAbiParameters, type Address } from "viem";

import { investorA, investorB } from "../actors/investors";
import { owner } from "../actors/owner";
import { Countries } from "../constants/countries";
import { SMARTRoles } from "../constants/roles";
import { SMARTTopic } from "../constants/topics";
import { smartProtocolDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { Asset } from "../types/asset";
import { waitForEvent } from "../utils/wait-for-event";
import { addCountryAllowListComplianceModule } from "./actions/add-country-allow-list-compliance-module";
import { burn } from "./actions/burn";
import { grantRole } from "./actions/grant-role";
import { issueAssetClassificationClaim } from "./actions/issue-asset-classification-claim";
import { issueIsinClaim } from "./actions/issue-isin-claim";
import { mint } from "./actions/mint";
import { transfer } from "./actions/transfer";
import { updateRequiredTopics } from "./actions/update-required-topic";

export const createEquity = async () => {
  console.log("\n=== Creating equity... ===\n");

  const equityFactory = smartProtocolDeployer.getEquityFactoryContract();

  const encodedBlockedCountries = encodeAbiParameters(
    parseAbiParameters("uint16[]"),
    [[]]
  );

  const transactionHash = await equityFactory.write.createEquity([
    "Apple",
    "AAPL",
    18,
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
    contract: equityFactory,
    eventName: "TokenAssetCreated",
  })) as {
    sender: Address;
    tokenAddress: Address;
    tokenIdentity: Address;
    accessManager: Address;
  };

  if (tokenAddress && tokenIdentity && accessManager) {
    const equity = new Asset(
      "Apple",
      "AAPL",
      tokenAddress,
      tokenIdentity,
      accessManager
    );

    // needs to be done so that he can update the topics and compliance modules
    await grantRole(equity, owner, SMARTRoles.tokenGovernanceRole);

    // set extra topic
    await updateRequiredTopics(equity, [SMARTTopic.kyc, SMARTTopic.aml]);

    // add country allow list compliance module
    await addCountryAllowListComplianceModule(equity, [
      Countries.BE,
      Countries.NL,
    ]);

    // needs to be done so that he can add the claims
    await grantRole(equity, owner, SMARTRoles.claimManagerRole);
    // issue isin claim
    await issueIsinClaim(equity, "DE000BAY0017");
    // issue asset classification claim
    await issueAssetClassificationClaim(equity, "Class A", "Category A");

    // needs supply management role to mint
    await grantRole(equity, owner, SMARTRoles.supplyManagementRole);

    await mint(equity, investorA, 100n, 18);
    await transfer(equity, investorA, investorB, 50n, 18);
    await burn(equity, investorB, 25n, 18);

    // TODO: execute all other functions of the equity

    return equity;
  }

  throw new Error("Failed to create equity");
};
