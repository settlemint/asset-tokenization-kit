import { Countries } from "../../constants/countries";
import { SMARTRoles } from "../../constants/roles";
import { SMARTTopic } from "../../constants/topics";
import { owner } from "../../entities/actors/owner";
import type { Asset } from "../../entities/asset";
import { smartProtocolDeployer } from "../../services/deployer";
import { addCountryAllowListComplianceModule } from "./add-country-allow-list-compliance-module";
import { grantRole } from "./grant-role";
import { issueAssetClassificationClaim } from "./issue-asset-classification-claim";
import { issueCollateralClaim } from "./issue-collateral-claim";
import { issueIsinClaim } from "./issue-isin-claim";
import { removeComplianceModule } from "./remove-compliance-module";
import { updateRequiredTopics } from "./update-required-topic";

export const setupAsset = async (
  asset: Asset<any>,
  {
    collateral,
    assetClass,
    assetCategory,
  }: {
    collateral?: bigint;
    assetClass?: string;
    assetCategory?: string;
  } = {}
) => {
  // needs to be done so that he can update the topics and compliance modules
  await grantRole(asset, owner, SMARTRoles.tokenGovernanceRole);

  // set extra topic
  await updateRequiredTopics(asset, [SMARTTopic.kyc, SMARTTopic.aml]);

  // add country allow list compliance module
  await addCountryAllowListComplianceModule(asset, [
    Countries.BE,
    Countries.NL,
  ]);

  // remove country block list compliance module
  await removeComplianceModule(
    asset,
    smartProtocolDeployer.getContractAddress("countryBlockListModule")
  );

  // needs to be done so that he can add the claims
  await grantRole(asset, owner, SMARTRoles.claimManagerRole);

  // issue isin claim
  await issueIsinClaim(asset, asset.isin);

  if (assetClass && assetCategory) {
    // issue asset classification claim
    await issueAssetClassificationClaim(asset, assetClass, assetCategory);
  }

  if (collateral) {
    // Update collateral
    const now = new Date();
    const oneYearFromNow = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate()
    );
    await issueCollateralClaim(
      asset,
      collateral,
      asset.decimals,
      oneYearFromNow
    );
  }
  // needs supply management role to mint
  await grantRole(asset, owner, SMARTRoles.supplyManagementRole);
};
