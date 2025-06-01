import type { Address } from "viem";
import { claimIssuer } from "../../actors/claim-issuer";
import { owner } from "../../actors/owner";
import { SMARTContracts } from "../../constants/contracts";

import { SMARTTopic } from "../../constants/topics";
import { encodeClaimData } from "../../utils/claim-scheme-utils";
import { formatDecimals } from "../../utils/format-decimals";
import { toDecimals } from "../../utils/to-decimals";
import { waitForSuccess } from "../../utils/wait-for-success";

/**
 * Issues a collateral claim to a token's identity contract.
 * The claim is created by the claimIssuer and added to the token's identity by the token owner.
 *
 * @param tokenIdentityAddress The address of the token's identity contract.
 * @param amount The collateral amount (as a BigInt).
 * @param decimals The number of decimals of the token.
 * @param expiryTimestamp The expiry timestamp of the collateral as a JavaScript `Date` object.
 */
export const issueCollateralClaim = async (
  tokenIdentityAddress: Address,
  amount: bigint,
  decimals: number,
  expiryTimestamp: Date,
) => {
  // Convert Date object to Unix timestamp (seconds) and then to bigint
  const expiryTimestampBigInt = BigInt(
    Math.floor(expiryTimestamp.getTime() / 1000),
  );

  const tokenAmount = toDecimals(amount, decimals);

  // 1. Encode the collateral claim data (amount, expiryTimestamp)
  // Corresponds to abi.encode(amount, expiryTimestamp) in Solidity
  const encodedCollateralData = encodeClaimData(SMARTTopic.collateral, [
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
    tokenIdentityAddress,
    SMARTTopic.collateral,
    encodedCollateralData,
  );

  // 3. Get an instance of the token's identity contract, interacted with by the 'owner' (assumed token owner)
  const tokenIdentityContract = owner.getContractInstance({
    address: tokenIdentityAddress,
    abi: SMARTContracts.tokenIdentity,
  });

  // 4. Get the identity address of the claim issuer
  const claimIssuerIdentityAddress = await claimIssuer.getIdentity();

  // 5. The token owner adds the claim (signed by the claimIssuer) to the token's identity contract
  // Corresponds to clientIdentity.addClaim(...) in Solidity, called by the token owner
  const transactionHash = await tokenIdentityContract.write.addClaim([
    topicId,
    BigInt(1), // ECDSA
    claimIssuerIdentityAddress,
    collateralClaimSignature,
    collateralClaimData,
    "",
  ]);

  await waitForSuccess(transactionHash);

  // Log with the original Date object for better readability if desired, or the timestamp
  console.log(
    `[Collateral claim] issued for token identity ${tokenIdentityAddress} with amount ${formatDecimals(tokenAmount, decimals)} and expiry ${expiryTimestamp.toISOString()} (Unix: ${expiryTimestampBigInt}).`,
  );
};
