"use server";

import { handleChallenge } from "@/lib/challenge";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
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

/**
 * GraphQL mutation for topping up the underlying asset of a yield schedule
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FixedYieldTopUpUnderlyingAsset = portalGraphql(`
  mutation FixedYieldTopUpUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: FixedYieldTopUpUnderlyingAssetInput!
  ) {
    FixedYieldTopUpUnderlyingAsset(
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
      parsedInput: { address, pincode, amount, underlyingAssetAddress, target, yieldScheduleAddress },
      ctx: { user },
    }) => {
      const asset = await getAssetUsersDetail({
        address: underlyingAssetAddress,
      });

      const formattedAmount = parseUnits(
        amount.toString(),
        asset.decimals
      ).toString();

      // Resolve spender based on target
      const spender = target === "bond" ? address : yieldScheduleAddress;
      if (!spender) {
        throw new Error("Invalid spender address");
      }

      // Approve spending of the underlying asset
      const approvalData = await portalClient.request(StableCoinApprove, {
        address: underlyingAssetAddress,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet, pincode),
        input: {
          spender,
          value: formattedAmount,
        },
      });

      const approvalTxHash = approvalData.StableCoinApprove?.transactionHash;
      if (!approvalTxHash) {
        throw new Error(
          "Failed to approve spending of the underlying asset"
        );
      }

      // Top up either the bond or the yield schedule
      if (target === "bond") {
        const response = await portalClient.request(BondTopUpUnderlyingAsset, {
          address,
          from: user.wallet,
          input: {
            amount: formattedAmount,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
        });

        if (!response.BondTopUpUnderlyingAsset?.transactionHash) {
          throw new Error("Failed to get transaction hash");
        }

        return z
          .hashes()
          .parse([response.BondTopUpUnderlyingAsset.transactionHash]);
      } else {
        // Top up the yield schedule
        if (!yieldScheduleAddress) {
          throw new Error("Yield schedule address is required for topping up yield");
        }

        const response = await portalClient.request(FixedYieldTopUpUnderlyingAsset, {
          address: yieldScheduleAddress,
          from: user.wallet,
          input: {
            amount: formattedAmount,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
        });

        if (!response.FixedYieldTopUpUnderlyingAsset?.transactionHash) {
          throw new Error("Failed to get transaction hash");
        }

        return z
          .hashes()
          .parse([response.FixedYieldTopUpUnderlyingAsset.transactionHash]);
      }
    }
  );
