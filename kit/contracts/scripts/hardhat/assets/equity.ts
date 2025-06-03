import { encodeAbiParameters, parseAbiParameters } from "viem";

import { SMARTTopic } from "../constants/topics";
import { investorA, investorB } from "../entities/actors/investors";
import { Asset } from "../entities/asset";
import { smartProtocolDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { burn } from "./actions/burn";
import { mint } from "./actions/mint";
import { setupAsset } from "./actions/setup-asset";
import { transfer } from "./actions/transfer";

export const createEquity = async () => {
  console.log("\n=== Creating equity... ===\n");

  const equityFactory = smartProtocolDeployer.getEquityFactoryContract();

  const equity = new Asset<"equityFactory">(
    "Apple",
    "AAPL",
    18,
    "US0378331005",
    equityFactory
  );

  const encodedBlockedCountries = encodeAbiParameters(
    parseAbiParameters("uint16[]"),
    [[]]
  );

  const transactionHash = await equityFactory.write.createEquity([
    equity.name,
    equity.symbol,
    equity.decimals,
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

  await equity.waitUntilDeployed(transactionHash);

  await setupAsset(equity, {
    assetClass: "Class A",
    assetCategory: "Category A",
  });

  await mint(equity, investorA, 100n, 18);
  await transfer(equity, investorA, investorB, 50n, 18);
  await burn(equity, investorB, 25n, 18);

  // TODO: execute all other functions of the equity

  return equity;
};
