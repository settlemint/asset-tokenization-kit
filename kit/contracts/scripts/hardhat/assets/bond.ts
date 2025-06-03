import { encodeAbiParameters, parseAbiParameters } from "viem";

import { smartProtocolDeployer } from "../services/deployer";

import { SMARTTopic } from "../constants/topics";
import { investorA, investorB } from "../entities/actors/investors";
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
import { claimYield } from "./actions/yield/claim-yield";
import { setYieldSchedule } from "./actions/yield/set-yield-schedule";
import { topupUnderlyingAsset } from "./actions/yield/topup-underlying-asset";
import { withdrawnUnderlyingAsset } from "./actions/yield/withdrawn-underlying-asset";

export const createBond = async (depositToken: Asset<any>) => {
  console.log("\n=== Creating bond... ===\n");

  const bondFactory = smartProtocolDeployer.getBondFactoryContract();

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
    BigInt(1000000 * 10 ** 6),
    BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60), // 1 year
    BigInt(123),
    depositToken.address!,
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

  await bond.waitUntilDeployed(transactionHash);

  await setupAsset(bond);

  // core
  await mint(bond, owner, 1000n);
  await mint(bond, investorA, 10n);
  await transfer(bond, investorA, investorB, 5n);

  // burnable
  await burn(bond, investorB, 2n);

  // Yield schedule
  await setYieldSchedule(
    bond,
    new Date(Date.now() + 1_000), // 1 second from now
    new Date(Date.now() + 5 * 60 * 1_000), // 5 minutes from now
    500, // 5%
    5 // 5 seconds
  );

  // custodian
  await forcedTransfer(bond, owner, investorA, investorB, 2n);
  await setAddressFrozen(bond, owner, investorA, true);
  await setAddressFrozen(bond, owner, investorA, false);
  await freezePartialTokens(bond, owner, investorB, 2n);
  await unfreezePartialTokens(bond, owner, investorB, 2n);

  // yield
  await topupUnderlyingAsset(bond, depositToken, 100n);
  // wait for the first period to close so the yield can be claimed
  await new Promise((resolve) => setTimeout(resolve, 6_000));
  await claimYield(bond);
  await new Promise((resolve) => setTimeout(resolve, 5_000));
  await claimYield(bond);
  await withdrawnUnderlyingAsset(bond, investorA.address, 5n);

  // TODO: execute all other functions of the bond

  return bond;
};
