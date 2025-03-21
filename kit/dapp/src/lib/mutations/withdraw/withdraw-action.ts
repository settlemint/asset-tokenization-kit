"use server";

import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { Bond } from "@/lib/queries/bond/bond-fragment";
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
      },
      ctx: { user },
    }) => {
      const asset = await getAssetDetail({
        address,
        assettype: "bond"
      }) as Bond;

      const underlyingAssetAddress = target === "bond" ? asset.underlyingAsset.id : asset.yieldSchedule?.underlyingAsset.id;
      const underlyingAssetType = target === "bond" ? asset.underlyingAsset.type as "bond" | "cryptocurrency" | "stablecoin" | "equity" | "fund" | "tokenizeddeposit" :
        asset.yieldSchedule?.underlyingAsset.type as "bond" | "cryptocurrency" | "stablecoin" | "equity" | "fund" | "tokenizeddeposit";
      if (!underlyingAssetAddress) {
        throw new Error(`Missing ${target === "bond" ? "underlying" : "yield underlying"} asset address`);
      }

      const underlyingAsset = await getAssetDetail({
        address: underlyingAssetAddress,
        assettype: underlyingAssetType
      });
      if (!underlyingAsset) {
        throw new Error(`Missing ${target === "bond" ? "underlying" : "yield underlying"} asset address`);
      }

      const spender = target === "bond" ? address : asset.yieldSchedule?.id;
      if (!spender) {
        throw new Error(`Missing ${target === "bond" ? "bond" : "yield schedule"} address`);
      }

      const formattedAmount = parseUnits(
        amount.toString(),
        asset.decimals
      ).toString();

      if (target === "bond") {
        const response = await portalClient.request(BondWithdrawUnderlyingAsset, {
          address: spender,
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
        const response = await portalClient.request(FixedYieldWithdrawUnderlyingAsset, {
          address: spender,
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
