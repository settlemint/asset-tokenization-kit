import type { Address } from "viem";
import { claimIssuer } from "../../actors/claim-issuer";
import { owner } from "../../actors/owner";
import { SMARTContracts } from "../../constants/contracts";

import { SMARTTopic } from "../../constants/topics";
import { encodeClaimData } from "../../utils/claim-scheme-utils";
import { waitForSuccess } from "../../utils/wait-for-success";

/**
 * Issues a collateral claim to a token's identity contract.
 * The claim is created by the claimIssuer and added to the token's identity by the token owner.
 *
 * @param tokenIdentityAddress The address of the token's identity contract.
 * @param assetClass The class of the asset.
 * @param assetCategory The category of the asset.
 */
export const issueAssetClassificationClaim = async (
  tokenIdentityAddress: Address,
  assetClass: string,
  assetCategory: string
) => {
  const encodedAssetClassificationData = encodeClaimData(
    SMARTTopic.assetClassification,
    [assetClass, assetCategory]
  );

  const {
    data: assetClassificationClaimData,
    signature: assetClassificationClaimSignature,
    topicId,
  } = await claimIssuer.createClaim(
    tokenIdentityAddress,
    SMARTTopic.assetClassification,
    encodedAssetClassificationData
  );

  const tokenIdentityContract = owner.getContractInstance({
    address: tokenIdentityAddress,
    abi: SMARTContracts.tokenIdentity,
  });

  const claimIssuerIdentityAddress = await claimIssuer.getIdentity();

  const transactionHash = await tokenIdentityContract.write.addClaim([
    topicId,
    BigInt(1), // ECDSA
    claimIssuerIdentityAddress,
    assetClassificationClaimSignature,
    assetClassificationClaimData,
    "",
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Asset classification claim] issued for token identity ${tokenIdentityAddress} with class "${assetClass}" and category "${assetCategory}".`
  );
};
