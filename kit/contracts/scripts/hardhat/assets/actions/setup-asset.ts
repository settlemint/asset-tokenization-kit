import { owner } from "../../constants/actors";
import { Countries } from "../../constants/countries";
import { ATKRoles } from "../../constants/roles";
import { ATKTopic } from "../../constants/topics";
import type { Asset } from "../../entities/asset";
import { atkDeployer } from "../../services/deployer";
import { getAnvilTimeMilliseconds } from "../../utils/anvil";
import { expressionBuilder } from "../../utils/expression-builder";
import { addCountryComplianceModule } from "./compliance/add-country-allow-list-compliance-module";
import { addTokenSupplyLimitComplianceModule } from "./compliance/add-token-supply-limit-compliance-module";
import { removeComplianceModule } from "./compliance/remove-compliance-module";
import { setCountryParametersForComplianceModule } from "./compliance/set-country-parameters-for-compliance-module";
import { grantRoles } from "./core/grant-roles";
import { issueAssetClassificationClaim } from "./core/issue-asset-classification-claim";
import { issueBasePriceClaim } from "./core/issue-base-price-claim";
import { issueCollateralClaim } from "./core/issue-collateral-claim";
import { issueIsinClaim } from "./core/issue-isin-claim";
import { updateRequiredTopics } from "./core/update-required-topic";
import { unpauseAsset } from "./pausable/unpause-asset";

export const setupAsset = async (
  asset: Asset<any>,
  {
    collateral,
    assetClass,
    assetCategory,
    basePrice,
    removeBlockedCountriesComplianceModule = true,
  }: {
    collateral?: number | bigint;
    assetClass?: string;
    assetCategory?: string;
    basePrice?: number;
    removeBlockedCountriesComplianceModule?: boolean;
  } = {}
) => {
  // needs to be done so that he can update the topics and compliance modules
  await grantRoles(asset, owner, [ATKRoles.assets.governanceRole]);

  // set extra topic
  await updateRequiredTopics(
    asset,
    expressionBuilder().topic(ATKTopic.kyc).and(ATKTopic.aml).build()
  );

  // add country allow list compliance module
  await addCountryComplianceModule(asset, "countryAllowListModule", [
    Countries.BE,
    Countries.NL,
  ]);

  await setCountryParametersForComplianceModule(
    asset,
    "countryAllowListModule",
    [Countries.BE, Countries.NL, Countries.FR, Countries.DE]
  );

  if (removeBlockedCountriesComplianceModule) {
    // remove country block list compliance module
    await removeComplianceModule(
      asset,
      atkDeployer.getContractAddress("countryBlockListModule")
    );
  }

  // needs to be done so that he can add the claims
  await grantRoles(asset, owner, [ATKRoles.assets.governanceRole]);

  // issue isin claim
  await issueIsinClaim(asset, asset.isin);

  if (assetClass && assetCategory) {
    // issue asset classification claim
    await issueAssetClassificationClaim(asset, assetClass, assetCategory);
  }

  if (collateral) {
    // Update collateral
    const anvilTime = new Date(await getAnvilTimeMilliseconds(owner));
    const oneYearFromNow = new Date(
      anvilTime.getFullYear() + 1,
      anvilTime.getMonth(),
      anvilTime.getDate()
    );
    await issueCollateralClaim(asset, collateral, oneYearFromNow);
  }

  if (basePrice) {
    // issue base price claim
    await issueBasePriceClaim(asset, basePrice);
    // add token supply limit compliance module for MiCa compliance
    await addTokenSupplyLimitComplianceModule(asset, {
      maxSupplyExact: 8_000_000,
      periodLengthDays: 365,
      rolling: true,
      useBasePrice: true,
      global: false,
    });
  }

  // needs supply management role to mint
  // needs custodian role for custodian actions
  await grantRoles(asset, owner, [
    ATKRoles.assets.supplyManagementRole,
    ATKRoles.assets.custodianRole,
    ATKRoles.assets.emergencyRole, // for unpausing
  ]);

  await unpauseAsset(asset);
};
