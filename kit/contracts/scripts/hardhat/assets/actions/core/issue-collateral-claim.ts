import { claimIssuer } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";

import { KeyType } from "../../../constants/key-types";
import { ATKTopic } from "../../../constants/topics";
import type { Asset } from "../../../entities/asset";
import { encodeClaimData } from "../../../utils/claim-scheme-utils";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForSuccess } from "../../../utils/wait-for-success";

/**
 * Issues a collateral claim to a token's identity contract.
 * The claim is created by the claimIssuer and added to the token's identity by the token owner.
 *
 * @param tokenIdentityAddress The address of the token's identity contract.
 * @param amount The collateral amount (as a BigInt).
 * @param expiryTimestamp The expiry timestamp of the collateral as a JavaScript `Date` object.
 */
export const issueCollateralClaim = async (
  asset: Asset<any>,
  amount: number | bigint,
  expiryTimestamp: Date
) => {
  console.log(`[Collateral claim] → Starting claim issuance...`);

  // Convert Date object to Unix timestamp (seconds) and then to bigint
  const expiryTimestampBigInt = BigInt(
    Math.floor(expiryTimestamp.getTime() / 1000)
  );

  const tokenAmount = toBaseUnits(amount, asset.decimals);

  // 1. Encode the collateral claim data (amount, expiryTimestamp)
  // Corresponds to abi.encode(amount, expiryTimestamp) in Solidity
  const encodedCollateralData = encodeClaimData(ATKTopic.collateral, [
    tokenAmount,
    expiryTimestampBigInt,
  ]);

  // 2. Create the claim using the claimIssuer's identity/key
  // The claimIssuer signs that this data is valid for the given topic and token identity
  const {
    data: collateralClaimData,
    signature: collateralClaimSignature,
    topicId,
  } = await claimIssuer.createClaim(
    asset.identity,
    ATKTopic.collateral,
    encodedCollateralData
  );

  const claimIssuerIdentityAddress = await claimIssuer.getIdentity();

  // 3. Get an instance of the token's identity contract, interacted with by the 'owner' (assumed token owner)
  const tokenIdentityContract = claimIssuer.getContractInstance({
    address: asset.identity!,
    abi: ATKContracts.contractIdentity,
  });

  // 4. Get the identity address of the claim issuer

  // 5. The token owner adds the claim (signed by the claimIssuer) to the token's identity contract
  // Corresponds to clientIdentity.addClaim(...) in Solidity, called by the token owner
  const transactionHash = await withDecodedRevertReason(() =>
    tokenIdentityContract.write.addClaim([
      topicId,
      KeyType.ecdsa,
      claimIssuerIdentityAddress,
      collateralClaimSignature,
      collateralClaimData,
      "",
    ])
  );

  await waitForSuccess(transactionHash);

  // Log with the original Date object for better readability if desired, or the timestamp
  console.log(
    `[Collateral claim] ✓ Claim issued for token identity ${asset.name} (${asset.identity}) with amount ${formatBaseUnits(tokenAmount, asset.decimals)} ${asset.symbol} and expiry ${expiryTimestamp.toISOString()} (Unix: ${expiryTimestampBigInt})`
  );
};
