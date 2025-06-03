import { encodeAbiParameters, parseAbiParameters } from "viem";

import { smartProtocolDeployer } from "../services/deployer";

import { investorA, investorB } from "../entities/actors/investors";

import { SMARTTopic } from "../constants/topics";
import { Asset } from "../entities/asset";
import { topicManager } from "../services/topic-manager";
import { burn } from "./actions/burn";
import { mint } from "./actions/mint";
import { setupAsset } from "./actions/setup-asset";
import { transfer } from "./actions/transfer";

export const createFund = async () => {
  console.log("\n=== Creating fund... ===\n");

  const fundFactory = smartProtocolDeployer.getFundFactoryContract();

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

  await fund.waitUntilDeployed(transactionHash);

  await setupAsset(fund, {
    assetClass: "Class A",
    assetCategory: "Category A",
  });

  await mint(fund, investorA, 10n);
  await transfer(fund, investorA, investorB, 5n);
  await burn(fund, investorB, 2n);

  // TODO: execute all other functions of the fund

  return fund;
};
