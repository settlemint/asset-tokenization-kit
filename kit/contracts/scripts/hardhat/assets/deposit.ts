import { encodeAbiParameters, parseAbiParameters } from "viem";
import { investorA, investorB } from "../entities/actors/investors";

import { SMARTTopic } from "../constants/topics";
import { Asset } from "../entities/asset";
import { smartProtocolDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { burn } from "./actions/burn";
import { mint } from "./actions/mint";
import { setupAsset } from "./actions/setup-asset";
import { transfer } from "./actions/transfer";

export const createDeposit = async () => {
  console.log("\n=== Creating deposit... ===\n");

  const depositFactory = smartProtocolDeployer.getDepositFactoryContract();

  const deposit = new Asset<"depositFactory">(
    "Euro Deposits",
    "EURD",
    6,
    "US1234567890",
    depositFactory
  );

  const encodedBlockedCountries = encodeAbiParameters(
    parseAbiParameters("uint16[]"),
    [[]]
  );

  const transactionHash = await depositFactory.write.createDeposit([
    deposit.name,
    deposit.symbol,
    deposit.decimals,
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

  await deposit.waitUntilDeployed(transactionHash);

  await setupAsset(deposit, {
    collateral: 1000n,
  });

  await mint(deposit, investorA, 1000n);
  await transfer(deposit, investorA, investorB, 500n);
  await burn(deposit, investorB, 250n);

  // create some users with identity claims
  // burn

  // TODO: execute all other functions of the deposit

  return deposit;
};
