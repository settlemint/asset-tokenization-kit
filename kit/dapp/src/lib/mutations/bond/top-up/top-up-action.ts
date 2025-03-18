"use server";

import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { TopUpSchema } from "./top-up-schema";

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

export const topUpUnderlyingAsset = action
  .schema(TopUpSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, amount, underlyingAssetAddress },
      ctx: { user },
    }) => {
      const asset = await getAssetDetail({ address: underlyingAssetAddress });

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
        throw new Error(
          "Failed to approve the bond to spend the underlying asset"
        );
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

      return z
        .hashes()
        .parse([response.BondTopUpUnderlyingAsset.transactionHash]);
    }
  );
