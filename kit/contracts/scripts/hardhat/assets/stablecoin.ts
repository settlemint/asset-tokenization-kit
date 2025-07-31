import { atkDeployer } from "../services/deployer";

import {
  frozenInvestor,
  investorA,
  investorB,
  owner,
} from "../constants/actors";

import { Countries } from "../constants/countries";
import { Asset } from "../entities/asset";
import { burn } from "./actions/burnable/burn";
import { mint } from "./actions/core/mint";
import { transfer } from "./actions/core/transfer";
import { forcedTransfer } from "./actions/custodian/forced-transfer";
import { freezePartialTokens } from "./actions/custodian/freeze-partial-tokens";
import { setAddressFrozen } from "./actions/custodian/set-address-frozen";
import { unfreezePartialTokens } from "./actions/custodian/unfreeze-partial-tokens";
import { setupAsset } from "./actions/setup-asset";
import { getDefaultComplianceModules } from "./utils/default-compliance-modules";

export const createStableCoin = async () => {
  console.log("\n=== Creating stablecoin... ===\n");

  const stablecoinFactory = atkDeployer.getStablecoinFactoryContract();

  const stableCoin = new Asset<"stablecoinFactory">(
    "Tether",
    "USDT",
    6,
    "JP3902900004",
    stablecoinFactory
  );

  const transactionHash = await stablecoinFactory.write.createStableCoin([
    stableCoin.name,
    stableCoin.symbol,
    stableCoin.decimals,
    getDefaultComplianceModules(),
    Countries.BE,
  ]);

  await stableCoin.waitUntilDeployed(transactionHash);

  await setupAsset(stableCoin, {
    collateral: 1000n,
    basePrice: 0.86,
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

  return stableCoin;
};
