import { atkDeployer } from "../services/deployer";

import {
  frozenInvestor,
  investorA,
  investorB,
  owner,
} from "../constants/actors";
import { Countries } from "../constants/countries";
import { Asset } from "../entities/asset";
import { getAnvilTimeMilliseconds, getAnvilTimeSeconds } from "../utils/anvil";
import { encodeAddressParams } from "../utils/encode-address-params";
import { toBaseUnits } from "../utils/to-base-units";
import { mature } from "./actions/bond/mature";
import { burn } from "./actions/burnable/burn";
import { setCap } from "./actions/capped/set-cap";
import { setAddressParametersForComplianceModule } from "./actions/compliance/set-address-parameters-for-compliance-module";
import { mint } from "./actions/core/mint";
import { transfer } from "./actions/core/transfer";
import { forcedTransfer } from "./actions/custodian/forced-transfer";
import { freezePartialTokens } from "./actions/custodian/freeze-partial-tokens";
import { setAddressFrozen } from "./actions/custodian/set-address-frozen";
import { unfreezePartialTokens } from "./actions/custodian/unfreeze-partial-tokens";
import { redeem } from "./actions/redeemable/redeem";
import { setupAsset } from "./actions/setup-asset";
import { claimYield } from "./actions/yield/claim-yield";
import { setYieldSchedule } from "./actions/yield/set-yield-schedule";
import { topupDenominationAsset } from "./actions/yield/topup-denomination-asset";
import { withdrawnDenominationAsset } from "./actions/yield/withdrawn-denomination-asset";
import { getDefaultComplianceModules } from "./utils/default-compliance-modules";

export const createBond = async (depositToken: Asset<any>) => {
  console.log("\n=== Creating bond... ===\n");

  const bondFactory = atkDeployer.getBondFactoryContract();

  const bond = new Asset<"bondFactory">(
    "Euro Bonds",
    "EURB",
    18,
    "DE000BAY0017",
    bondFactory
  );

  // Get allowed identities for the bond
  const bondAllowedIdentities = await Promise.all([
    investorA.getIdentity(),
    investorB.getIdentity(),
    owner.getIdentity(),
    frozenInvestor.getIdentity(),
  ]);

  const anvilTimeSeconds = await getAnvilTimeSeconds(owner);
  const faceValue = toBaseUnits(0.000123, depositToken.decimals);
  const cap = toBaseUnits(1_000_000, bond.decimals);
  const transactionHash = await bondFactory.write.createBond([
    bond.name,
    bond.symbol,
    bond.decimals,
    cap,
    {
      maturityDate: BigInt(anvilTimeSeconds + 365 * 24 * 60 * 60), // 1 year
      faceValue: faceValue,
      denominationAsset: depositToken.address!,
    },
    [
      ...getDefaultComplianceModules(),
      {
        module: atkDeployer.getContractAddress("identityAllowListModule"),
        params: encodeAddressParams(bondAllowedIdentities),
      },
    ],
    Countries.BE,
  ]);

  await bond.waitUntilDeployed(transactionHash);

  await setupAsset(bond);

  // core
  await mint(bond, owner, 100n);
  await mint(bond, investorA, 10n);
  await transfer(bond, investorA, investorB, 5n);

  // burnable
  await burn(bond, investorB, 2n);

  // capped
  await setCap(bond, 1_500_000n);

  // custodian
  await forcedTransfer(bond, owner, investorA, investorB, 2n);
  await setAddressFrozen(bond, owner, frozenInvestor, true);
  await freezePartialTokens(bond, owner, investorB, 2n);
  await unfreezePartialTokens(bond, owner, investorB, 2n);

  // yield
  const anvilTime = await getAnvilTimeMilliseconds(owner);
  const { advanceToNextPeriod, scheduleContract } = await setYieldSchedule(
    bond,
    new Date(anvilTime + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    new Date(anvilTime + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    50, // 0.5%
    12 * 60 * 60, // 12 hours in seconds
    Countries.BE
  );

  // Make sure bond and yield can hold deposit token
  const allowedIdentities = await Promise.all([
    investorA.getIdentity(),
    investorB.getIdentity(),
    // owner also needs to be able to hold deposit token ... topUpDenominationAsset will mint to owner
    owner.getIdentity(),
    bond.address,
    scheduleContract.address,
  ]);

  await setAddressParametersForComplianceModule(
    depositToken,
    "identityAllowListModule",
    allowedIdentities
  );

  // do some mint/burns to change the yield
  await mint(bond, owner, 10n);
  await burn(bond, owner, 1n);
  await topupDenominationAsset(bond, depositToken, 10000n);
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
  await withdrawnDenominationAsset(bond, depositToken, investorA.address, 5n);

  // mature bond
  await mint(depositToken, bond.address, 150n);
  await mature(bond);

  // redeemable
  await redeem(bond, owner, 10n);
  await redeem(bond, investorB, 1n);

  return bond;
};
