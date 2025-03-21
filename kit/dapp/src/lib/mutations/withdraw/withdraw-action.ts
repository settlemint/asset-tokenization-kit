"use server";

import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../safe-action";
import { WithdrawSchema } from "./withdraw-schema";

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

export const withdraw = action
  .schema(WithdrawSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: {
        target,
        address,
        pincode,
        amount,
        to,
        underlyingAssetAddress,
        underlyingAssetType,
        yieldScheduleAddress,
        yieldUnderlyingAssetAddress,
        yieldUnderlyingAssetType
      },
      ctx: { user },
    }) => {
      // Determine the correct underlying asset address and contract address based on target
      const assetAddress = target === "bond" ? underlyingAssetAddress : yieldUnderlyingAssetAddress;
      const contractAddress = target === "bond" ? address : yieldScheduleAddress;
      const assetType = target === "bond" ? underlyingAssetType : yieldUnderlyingAssetType;

      if (!assetAddress) {
        throw new Error(`Missing ${target === "bond" ? "underlying" : "yield underlying"} asset address`);
      }

      if (!contractAddress) {
        throw new Error(`Missing ${target === "bond" ? "bond" : "yield schedule"} address`);
      }

      if (!assetType) {
        throw new Error(`Missing asset type for ${target === "bond" ? "underlying" : "yield underlying"} asset`);
      }

      // Get token details for decimals
      const asset = await getAssetDetail({
        address: assetAddress,
        assettype: assetType as "bond" | "cryptocurrency" | "stablecoin" | "equity" | "fund" | "tokenizeddeposit"
      });

      const formattedAmount = parseUnits(
        amount.toString(),
        asset.decimals
      ).toString();


      if (target === "bond") {
        const response = await portalClient.request(BondWithdrawUnderlyingAsset, {
          address,
          from: user.wallet,
          input: {
            to,
            amount: formattedAmount,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
        });

        if (!response.BondWithdrawUnderlyingAsset?.transactionHash) {
          throw new Error("Failed to get transaction hash");
        }

        return z
          .hashes()
          .parse([response.BondWithdrawUnderlyingAsset.transactionHash]);
      } else {
        // Top up the yield schedule
        if (!yieldScheduleAddress) {
          throw new Error("Yield schedule address is required for topping up yield");
        }

        const response = await portalClient.request(FixedYieldWithdrawUnderlyingAsset, {
          address: yieldScheduleAddress,
          from: user.wallet,
          input: {
            to,
            amount: formattedAmount,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
        });

        if (!response.FixedYieldWithdrawUnderlyingAsset?.transactionHash) {
          throw new Error("Failed to get transaction hash");
        }

        return z
          .hashes()
          .parse([response.FixedYieldWithdrawUnderlyingAsset.transactionHash]);
      }
    }
  );
