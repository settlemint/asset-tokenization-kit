"use server";

import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from '@/lib/queries/asset/asset-detail';
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { WithdrawSchema } from "./withdraw-schema";

/**
 * GraphQL mutation for withdrawing the underlying asset of a bond
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const WithdrawUnderlyingAsset = portalGraphql(`
  mutation WithdrawUnderlyingAsset(
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

export const withdrawUnderlyingAsset = action
  .schema(WithdrawSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, amount, to, underlyingAssetAddress },
      ctx: { user },
    }) => {
      const asset = await getAssetDetail({ address: underlyingAssetAddress });

      const response = await portalClient.request(WithdrawUnderlyingAsset, {
        address,
        from: user.wallet,
        input: {
          to,
          amount: parseUnits(amount.toString(), asset.decimals).toString(),
        },
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      if (!response.BondWithdrawUnderlyingAsset?.transactionHash) {
        throw new Error("Failed to get transaction hash");
      }

      return z.hashes().parse([response.BondWithdrawUnderlyingAsset.transactionHash]);
    }
  );