import { ATKContracts } from "../../../constants/contracts";
import { claimIssuer } from "../../../entities/actors/claim-issuer";
import { owner } from "../../../entities/actors/owner";

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

  const tokenIdentityContract = owner.getContractInstance({
    address: asset.identity,
    abi: ATKContracts.tokenIdentity,
  });

  const claimIssuerIdentityAddress = await claimIssuer.getIdentity();

  const transactionHash = await withDecodedRevertReason(() =>
    tokenIdentityContract.write.addClaim([
      topicId,
      BigInt(1), // ECDSA
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
