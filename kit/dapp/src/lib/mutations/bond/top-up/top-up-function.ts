import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { TopUpInput } from "./top-up-schema";

/**
 * GraphQL mutation for approving a token for spending
 */
const StableCoinApprove = portalGraphql(`
  mutation StableCoinApprove(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: StableCoinApproveInput!
  ) {
    StableCoinApprove(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for topping up the underlying asset of a bond
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const BondTopUpUnderlyingAsset = portalGraphql(`
  mutation TopUpUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: BondTopUpUnderlyingAssetInput!
  ) {
    BondTopUpUnderlyingAsset(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to top up the underlying asset of a bond
 *
 * @param input - Validated input for topping up the bond
 * @param user - The user initiating the top up operation
 * @returns The transaction hash
 */
export async function topUpUnderlyingAssetFunction({
  parsedInput: { address, pincode, amount, underlyingAssetAddress },
  ctx: { user },
}: {
  parsedInput: TopUpInput;
  ctx: { user: User };
}) {
  const asset = await getAssetUsersDetail({
    address: underlyingAssetAddress,
  });

  const formattedAmount = parseUnits(
    amount.toString(),
    asset.decimals
  ).toString();

  const approvalData = await portalClient.request(StableCoinApprove, {
    address: underlyingAssetAddress,
    from: user.wallet,
    challengeResponse: await handleChallenge(user.wallet, pincode),
    input: {
      spender: address,
      value: formattedAmount,
    },
  });

  const approvalTxHash = approvalData.StableCoinApprove?.transactionHash;
  if (!approvalTxHash) {
    throw new Error("Failed to approve the bond to spend the underlying asset");
  }

  const response = await portalClient.request(BondTopUpUnderlyingAsset, {
    address,
    from: user.wallet,
    input: {
      amount: parseUnits(amount.toString(), asset.decimals).toString(),
    },
    challengeResponse: await handleChallenge(user.wallet, pincode),
  });

  if (!response.BondTopUpUnderlyingAsset?.transactionHash) {
    throw new Error("Failed to get transaction hash");
  }

  return safeParse(t.Hashes(), [
    response.BondTopUpUnderlyingAsset.transactionHash,
  ]);
}
