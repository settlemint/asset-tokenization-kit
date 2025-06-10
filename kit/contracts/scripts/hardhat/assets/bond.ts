import { encodeAbiParameters, parseAbiParameters } from "viem";

import { atkDeployer } from "../services/deployer";

import { ATKTopic } from "../constants/topics";
import {
  frozenInvestor,
  investorA,
  investorB,
} from "../entities/actors/investors";
import { owner } from "../entities/actors/owner";
import { Asset } from "../entities/asset";
import { topicManager } from "../services/topic-manager";
import { getAnvilTimeMilliseconds } from "../utils/anvil";
import { toDecimals } from "../utils/to-decimals";
import { burn } from "./actions/burnable/burn";
import { mint } from "./actions/core/mint";
import { transfer } from "./actions/core/transfer";
import { forcedTransfer } from "./actions/custodian/forced-transfer";
import { freezePartialTokens } from "./actions/custodian/freeze-partial-tokens";
import { setAddressFrozen } from "./actions/custodian/set-address-frozen";
import { unfreezePartialTokens } from "./actions/custodian/unfreeze-partial-tokens";
import { setupAsset } from "./actions/setup-asset";
import { claimYield } from "./actions/yield/claim-yield";
import { setYieldSchedule } from "./actions/yield/set-yield-schedule";
import { topupUnderlyingAsset } from "./actions/yield/topup-underlying-asset";
import { withdrawnUnderlyingAsset } from "./actions/yield/withdrawn-underlying-asset";

export const createBond = async (depositToken: Asset<any>) => {
  console.log("\n=== Creating bond... ===\n");

  const bondFactory = atkDeployer.getBondFactoryContract();

  const bond = new Asset<"bondFactory">(
    "Euro Bonds",
    "EURB",
    6,
    "DE000BAY0017",
    bondFactory
  );

  const encodedBlockedCountries = encodeAbiParameters(
    parseAbiParameters("uint16[]"),
    [[]]
  );

  const transactionHash = await bondFactory.write.createBond([
    bond.name,
    bond.symbol,
    bond.decimals,
    toDecimals(1000000, bond.decimals),
    BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60), // 1 year
    BigInt(123),
    depositToken.address!,
    [topicManager.getTopicId(ATKTopic.kyc)],
    [
      {
        module: atkDeployer.getContractAddress("countryBlockListModule"),
        params: encodedBlockedCountries,
      },
    ],
  ]);

  await bond.waitUntilDeployed(transactionHash);

  await setupAsset(bond);

  // core
  await mint(bond, owner, 100n);
  await mint(bond, investorA, 10n);
  await transfer(bond, investorA, investorB, 5n);

  // burnable
  await burn(bond, investorB, 2n);

  // custodian
  await forcedTransfer(bond, owner, investorA, investorB, 2n);
  await setAddressFrozen(bond, owner, frozenInvestor, true);
  await freezePartialTokens(bond, owner, investorB, 2n);
  await unfreezePartialTokens(bond, owner, investorB, 2n);

  // yield
  const anvilTime = await getAnvilTimeMilliseconds(owner);
  const { advanceToNextPeriod } = await setYieldSchedule(
    bond,
    new Date(anvilTime + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    new Date(anvilTime + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    50, // 0.5%
    12 * 60 * 60 // 12 hours in seconds
  );
  // do some mint/burns to change the yield
  await mint(bond, owner, 10n);
  await burn(bond, owner, 1n);
  await topupUnderlyingAsset(bond, depositToken, 10000n);
  // claim yield for 3 periods
  for (let i = 0; i < 3; i++) {
    const didAdvance = await advanceToNextPeriod();
    if (!didAdvance) {
      console.log(
        `[Bond] ${bond.symbol} schedule has already completed all periods. Cannot advance further.`
      );
      break;
    }
    await claimYield(bond, depositToken, owner);
    // transfer some tokens to change the claimed yields for the next period
    await transfer(bond, owner, investorA, 6n);
    await transfer(bond, owner, investorB, 3n);
  }
  await withdrawnUnderlyingAsset(bond, depositToken, investorA.address, 5n);

  // TODO: execute all other functions of the bond

  return bond;
};
