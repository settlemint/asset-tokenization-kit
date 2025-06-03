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

export const createStablecoin = async () => {
  console.log("\n=== Creating stablecoin... ===\n");

  const stablecoinFactory =
    smartProtocolDeployer.getStablecoinFactoryContract();

  const stableCoin = new Asset<"stablecoinFactory">(
    "Tether",
    "USDT",
    6,
    "JP3902900004",
    stablecoinFactory
  );

  const encodedBlockedCountries = encodeAbiParameters(
    parseAbiParameters("uint16[]"),
    [[]]
  );

  const transactionHash = await stablecoinFactory.write.createStableCoin([
    stableCoin.name,
    stableCoin.symbol,
    stableCoin.decimals,
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

  await stableCoin.waitUntilDeployed(transactionHash);

  await setupAsset(stableCoin, {
    collateral: 1000n,
  });

  await mint(stableCoin, investorA, 1000n, 6);
  await transfer(stableCoin, investorA, investorB, 500n, 6);
  await burn(stableCoin, investorB, 250n, 6);

  // TODO: execute all other functions of the stablecoin

  return stableCoin;
};
