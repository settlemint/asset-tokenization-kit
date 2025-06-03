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
  await mint(bond, investorA, 10n);
  await transfer(bond, investorA, investorB, 5n);

  // burnable
  await burn(bond, investorB, 2n);

  // custodian
  await forcedTransfer(bond, owner, investorA, investorB, 2n);
  await setAddressFrozen(bond, owner, investorA, true);
  await setAddressFrozen(bond, owner, investorA, false);
  await freezePartialTokens(bond, owner, investorB, 2n);
  await unfreezePartialTokens(bond, owner, investorB, 2n);

  // TODO: add yield etc
  // TODO: execute all other functions of the bond

  return bond;
};
