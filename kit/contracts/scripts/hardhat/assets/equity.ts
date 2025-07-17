import { Countries } from "../constants/countries";
import { ATKTopic } from "../constants/topics";
import {
  frozenInvestor,
  investorA,
  investorB,
} from "../entities/actors/investors";
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
import { getDefaultComplianceModules } from "./utils/default-compliance-modules";

export const createEquity = async () => {
  console.log("\n=== Creating equity... ===\n");

  const equityFactory = atkDeployer.getEquityFactoryContract();

  const equity = new Asset<"equityFactory">(
    "Apple",
    "AAPL",
    18,
    "US0378331005",
    equityFactory
  );

  const transactionHash = await equityFactory.write.createEquity([
    equity.name,
    equity.symbol,
    equity.decimals,
    [topicManager.getTopicId(ATKTopic.kyc)],
    getDefaultComplianceModules(),
    Countries.BE,
  ]);

  await equity.waitUntilDeployed(transactionHash);

  await setupAsset(equity, {
    assetClass: "Class A",
    assetCategory: "Category A",
    basePrice: 173.02,
  });

  // core
  await mint(equity, investorA, 100n);
  await transfer(equity, investorA, investorB, 50n);

  // burnable
  await burn(equity, investorB, 25n);

  // custodian
  await forcedTransfer(equity, owner, investorA, investorB, 25n);
  await setAddressFrozen(equity, owner, frozenInvestor, true);
  await freezePartialTokens(equity, owner, investorB, 25n);
  await unfreezePartialTokens(equity, owner, investorB, 12n);

  return equity;
};
