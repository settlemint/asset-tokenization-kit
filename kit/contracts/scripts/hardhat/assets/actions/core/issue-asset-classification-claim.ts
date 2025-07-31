import { claimIssuer } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";

import { KeyType } from "../../../constants/key-types";
import { ATKTopic } from "../../../constants/topics";
import { Asset } from "../../../entities/asset";
import { encodeClaimData } from "../../../utils/claim-scheme-utils";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

/**
 * Issues a collateral claim to a token's identity contract.
 * The claim is created by the claimIssuer and added to the token's identity by the token owner.
 *
 * @param tokenIdentityAddress The address of the token's identity contract.
 * @param assetClass The class of the asset.
 * @param assetCategory The category of the asset.
 */
export const issueAssetClassificationClaim = async (
  asset: Asset<any>,
  assetClass: string,
  assetCategory: string
) => {
  console.log(`[Asset classification claim] → Starting claim issuance...`);

  const encodedAssetClassificationData = encodeClaimData(
    ATKTopic.assetClassification,
    [assetClass, assetCategory]
  );

  const {
    data: assetClassificationClaimData,
    signature: assetClassificationClaimSignature,
    topicId,
  } = await claimIssuer.createClaim(
    asset.identity!,
    ATKTopic.assetClassification,
    encodedAssetClassificationData
  );

  const claimIssuerIdentityAddress = await claimIssuer.getIdentity();

  const tokenIdentityContract = claimIssuer.getContractInstance({
    address: asset.identity,
    abi: ATKContracts.contractIdentity,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    tokenIdentityContract.write.addClaim([
      topicId,
      KeyType.ecdsa,
      claimIssuerIdentityAddress,
      assetClassificationClaimSignature,
      assetClassificationClaimData,
      "",
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Asset classification claim] ✓ Claim issued for token identity ${asset.name} (${asset.identity}) with class "${assetClass}" and category "${assetCategory}"`
  );
};
