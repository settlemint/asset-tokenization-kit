import { encodeAbiParameters, parseAbiParameters } from "viem";
import {
  frozenInvestor,
  investorA,
  investorB,
} from "../entities/actors/investors";

import { ATKTopic } from "../constants/topics";
import { owner } from "../entities/actors/owner";
import { Asset } from "../entities/asset";
import { atkDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { burn } from "./actions/burnable/burn";
import { mint } from "./actions/core/mint";
import { transfer } from "./actions/core/transfer";
import { forcedTransfer } from "./actions/custodian/forced-transfer";
import { freezePartialTokens } from "./actions/custodian/freeze-partial-tokens";
import { setAddressFrozen } from "./actions/custodian/set-address-frozen";
import { unfreezePartialTokens } from "./actions/custodian/unfreeze-partial-tokens";
import { setupAsset } from "./actions/setup-asset";

export const createDeposit = async () => {
  console.log("\n=== Creating deposit... ===\n");

  const depositFactory = atkDeployer.getDepositFactoryContract();

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
    [topicManager.getTopicId(ATKTopic.kyc)],
    [
      {
        module: atkDeployer.getContractAddress("countryBlockListModule"),
        params: encodedBlockedCountries,
      },
    ],
  ]);

  await deposit.waitUntilDeployed(transactionHash);

  await setupAsset(deposit, {
    collateral: 100000n,
  });

  // core
  await mint(deposit, investorA, 1000n);
  await transfer(deposit, investorA, investorB, 500n);

  // burnable
  await burn(deposit, investorB, 250n);

  // custodian
  await forcedTransfer(deposit, owner, investorA, investorB, 250n);
  await setAddressFrozen(deposit, owner, frozenInvestor, true);
  await freezePartialTokens(deposit, owner, investorB, 250n);
  await unfreezePartialTokens(deposit, owner, investorB, 125n);

  // TODO: execute all other functions of the deposit

  return deposit;
};
