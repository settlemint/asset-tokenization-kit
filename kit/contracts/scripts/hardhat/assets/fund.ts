import { encodeAbiParameters, parseAbiParameters } from "viem";

import { atkDeployer } from "../services/deployer";

import {
  frozenInvestor,
  investorA,
  investorB,
} from "../entities/actors/investors";

import { ATKTopic } from "../constants/topics";
import { owner } from "../entities/actors/owner";
import { Asset } from "../entities/asset";
import { topicManager } from "../services/topic-manager";
import { burn } from "./actions/burnable/burn";
import { mint } from "./actions/core/mint";
import { transfer } from "./actions/core/transfer";
import { forcedTransfer } from "./actions/custodian/forced-transfer";
import { freezePartialTokens } from "./actions/custodian/freeze-partial-tokens";
import { setAddressFrozen } from "./actions/custodian/set-address-frozen";
import { unfreezePartialTokens } from "./actions/custodian/unfreeze-partial-tokens";
import { collectManagementFee } from "./actions/fund/collect-management-fee";
import { setupAsset } from "./actions/setup-asset";

export const createFund = async () => {
  console.log("\n=== Creating fund... ===\n");

  const fundFactory = atkDeployer.getFundFactoryContract();

  const fund = new Asset<"fundFactory">(
    "Bens Bugs",
    "BB",
    8,
    "FR0000120271",
    fundFactory
  );

  const encodedBlockedCountries = encodeAbiParameters(
    parseAbiParameters("uint16[]"),
    [[]]
  );

  const transactionHash = await fundFactory.write.createFund([
    fund.name,
    fund.symbol,
    fund.decimals,
    20,
    [topicManager.getTopicId(ATKTopic.kyc)],
    [
      {
        module: atkDeployer.getContractAddress("countryBlockListModule"),
        params: encodedBlockedCountries,
      },
    ],
  ]);

  await fund.waitUntilDeployed(transactionHash);

  await setupAsset(fund, {
    assetClass: "Class A",
    assetCategory: "Category A",
  });

  // core
  await mint(fund, investorA, 10n);
  await transfer(fund, investorA, investorB, 5n);

  // burnable
  await burn(fund, investorB, 2n);

  // custodian
  await forcedTransfer(fund, owner, investorA, investorB, 2n);
  await setAddressFrozen(fund, owner, frozenInvestor, true);
  await freezePartialTokens(fund, owner, investorB, 2n);
  await unfreezePartialTokens(fund, owner, investorB, 1n);

  // management fee
  await collectManagementFee(fund, 30);
  await collectManagementFee(fund, 8);

  return fund;
};
