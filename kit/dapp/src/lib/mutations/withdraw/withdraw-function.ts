import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from '@/lib/utils/typebox';
import { parseUnits } from "viem";
import type { WithdrawInput } from "./withdraw-schema";

/**
 * GraphQL mutation for withdrawing the underlying asset of a bond
 */
const BondWithdrawUnderlyingAsset = portalGraphql(`
  mutation BondWithdrawUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: BondWithdrawUnderlyingAssetInput!
  ) {
    BondWithdrawUnderlyingAsset(
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
 * GraphQL mutation for withdrawing the underlying asset of a yield schedule
 */
const FixedYieldWithdrawUnderlyingAsset = portalGraphql(`
  mutation FixedYieldWithdrawUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: FixedYieldWithdrawUnderlyingAssetInput!
  ) {
    FixedYieldWithdrawUnderlyingAsset(
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
 * Function to withdraw tokens or underlying assets from a contract
 *
 * @param input - Validated input containing address, pincode, amount, to, underlyingAssetAddress, and assettype
 * @param user - The user executing the withdraw operation
 * @returns Array of transaction hashes
 */
export async function withdrawFunction({
  parsedInput: {
    target,
    targetAddress,
    pincode,
    amount,
    to,
    underlyingAssetAddress,
    underlyingAssetType
  },
  ctx: { user },
}: {
  parsedInput: WithdrawInput;
  ctx: { user: User };
}) {
  // Get asset details
  const asset = await getAssetDetail({
    address: targetAddress,
    assettype: "bond"
  });

  if (!asset) {
    throw new Error("Missing asset details");
  }

  // Get underlying asset details
  const underlyingAsset = await getAssetDetail({
    address: underlyingAssetAddress,
    assettype: underlyingAssetType
  });

  if (!underlyingAsset) {
    throw new Error(`Missing underlying asset details for ${underlyingAssetType} with address: ${underlyingAssetAddress}`);
  }

  // Format amount with proper decimals
  const formattedAmount = parseUnits(
    amount.toString(),
    underlyingAsset.decimals
  ).toString();

  // Get challenge response
  const challengeResponse = await handleChallenge(user.wallet, pincode);

  // Withdraw based on target type
  if (target === "bond") {
    const response = await portalClient.request(BondWithdrawUnderlyingAsset, {
      address: targetAddress,
      from: user.wallet,
      input: {
        to,
        amount: formattedAmount,
      },
      challengeResponse,
    });

    if (!response.BondWithdrawUnderlyingAsset?.transactionHash) {
      throw new Error("Failed to get bond withdrawal transaction hash");
    }

    return safeParse(t.Hashes(), [response.BondWithdrawUnderlyingAsset.transactionHash]);
  } else {
    const response = await portalClient.request(FixedYieldWithdrawUnderlyingAsset, {
      address: targetAddress,
      from: user.wallet,
      input: {
        to,
        amount: formattedAmount,
      },
      challengeResponse,
    });

    if (!response.FixedYieldWithdrawUnderlyingAsset?.transactionHash) {
      throw new Error("Failed to get yield schedule withdrawal transaction hash");
    }

    return safeParse(t.Hashes(), [response.FixedYieldWithdrawUnderlyingAsset.transactionHash]);
  }
}
