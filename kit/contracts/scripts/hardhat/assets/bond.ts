import { encodeAbiParameters, parseAbiParameters } from "viem";

import { smartProtocolDeployer } from "../services/deployer";

import { SMARTTopic } from "../constants/topics";
import { investorA, investorB } from "../entities/actors/investors";
import { Asset } from "../entities/asset";
import { topicManager } from "../services/topic-manager";
import { burn } from "./actions/burn";
import { mint } from "./actions/mint";
import { setupAsset } from "./actions/setup-asset";
import { transfer } from "./actions/transfer";
import { claimYield } from "./actions/yield/claim-yield";
import { setYieldSchedule } from "./actions/yield/set-yield-schedule";

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

  await mint(bond, investorA, 10n);
  await transfer(bond, investorA, investorB, 5n);
  await burn(bond, investorB, 2n);

  await setYieldSchedule(
    bond,
    new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    500, // 5%
    86400 // 1 day
  );
  await claimYield(bond);

  // TODO: execute all other functions of the bond

  return bond;
};
