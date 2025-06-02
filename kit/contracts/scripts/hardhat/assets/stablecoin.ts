import { encodeAbiParameters, parseAbiParameters, type Address } from "viem";

import { owner } from "../actors/owner";
import { smartProtocolDeployer } from "../services/deployer";
import { waitForEvent } from "../utils/wait-for-event";

import { investorA, investorB } from "../actors/investors";
import { SMARTRoles } from "../constants/roles";

import { Countries } from "../constants/countries";
import { SMARTTopic } from "../constants/topics";
import { topicManager } from "../services/topic-manager";
import { Asset } from "../types/asset";
import { addCountryAllowListComplianceModule } from "./actions/add-country-allow-list-compliance-module";
import { burn } from "./actions/burn";
import { grantRole } from "./actions/grant-role";
import { issueCollateralClaim } from "./actions/issue-collateral-claim";
import { issueIsinClaim } from "./actions/issue-isin-claim";
import { mint } from "./actions/mint";
import { transfer } from "./actions/transfer";
import { updateRequiredTopics } from "./actions/update-required-topic";

export const createStablecoin = async () => {
  console.log("\n=== Creating stablecoin... ===\n");

  const stablecoinFactory =
    smartProtocolDeployer.getStablecoinFactoryContract();

  const encodedBlockedCountries = encodeAbiParameters(
    parseAbiParameters("uint16[]"),
    [[]]
  );

  const transactionHash = await stablecoinFactory.write.createStableCoin([
    "Tether",
    "USDT",
    6,
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
    contract: stablecoinFactory,
    eventName: "TokenAssetCreated",
  })) as {
    sender: Address;
    tokenAddress: Address;
    tokenIdentity: Address;
    accessManager: Address;
  };

  if (tokenAddress && tokenIdentity && accessManager) {
    const stableCoin = new Asset(
      "Tether",
      "USDT",
      tokenAddress,
      tokenIdentity,
      accessManager
    );

    // needs to be done so that he can update the topics and compliance modules
    await grantRole(stableCoin, owner, SMARTRoles.tokenGovernanceRole);

    // set extra topic
    await updateRequiredTopics(stableCoin, [SMARTTopic.kyc, SMARTTopic.aml]);

    // add country allow list compliance module
    await addCountryAllowListComplianceModule(stableCoin, [
      Countries.BE,
      Countries.NL,
    ]);

    // needs to be done so that he can add the claims
    await grantRole(stableCoin, owner, SMARTRoles.claimManagerRole);
    // issue isin claim
    await issueIsinClaim(stableCoin, "JP3902900004");

    // Update collateral
    const now = new Date();
    const oneYearFromNow = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate()
    );
    await issueCollateralClaim(stableCoin, 1000n, 6, oneYearFromNow);

    // needs supply management role to mint
    await grantRole(stableCoin, owner, SMARTRoles.supplyManagementRole);

    await mint(stableCoin, investorA, 1000n, 6);
    await transfer(stableCoin, investorA, investorB, 500n, 6);
    await burn(stableCoin, investorB, 250n, 6);

    // TODO: execute all other functions of the stablecoin

    return stableCoin;
  }

  throw new Error("Failed to create deposit");
};
