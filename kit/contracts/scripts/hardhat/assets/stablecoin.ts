import { encodeAbiParameters, parseAbiParameters } from "viem";

import { smartProtocolDeployer } from "../services/deployer";

import {
  frozenInvestor,
  investorA,
  investorB,
} from "../entities/actors/investors";

import { SMARTTopic } from "../constants/topics";
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
import { setupAsset } from "./actions/setup-asset";

export const createStableCoin = async () => {
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

  // core
  await mint(stableCoin, investorA, 1000n);
  await transfer(stableCoin, investorA, investorB, 500n);

  // burnable
  await burn(stableCoin, investorB, 250n);

  // custodian
  await forcedTransfer(stableCoin, owner, investorA, investorB, 250n);
  await setAddressFrozen(stableCoin, owner, frozenInvestor, true);
  await freezePartialTokens(stableCoin, owner, investorB, 250n);
  await unfreezePartialTokens(stableCoin, owner, investorB, 125n);

  // TODO: execute all other functions of the stablecoin

  return stableCoin;
};
