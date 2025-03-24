"use server";

import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import { action } from "../safe-action";
import { UpdateCollateralSchema } from "./update-collateral-schema";

/**
 * GraphQL mutation for updating a stablecoin's collateral amount
 */
const StableCoinUpdateCollateral = portalGraphql(`
  mutation StableCoinUpdateCollateral($address: String!, $from: String!, $challengeResponse: String!, $input: StableCoinUpdateCollateralInput!) {
    StableCoinUpdateCollateral(
      address: $address
      from: $from
      input: $input
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for updating a tokenized deposit's collateral amount
 */
const TokenizedDepositUpdateCollateral = portalGraphql(`
  mutation TokenizedDepositUpdateCollateral($address: String!, $from: String!, $challengeResponse: String!, $input: TokenizedDepositUpdateCollateralInput!) {
    TokenizedDepositUpdateCollateral(
      address: $address
      from: $from
      input: $input
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const updateCollateral = action
  .schema(UpdateCollateralSchema())
  .outputSchema(t.Hashes())
  .action(
    async ({
      parsedInput: { address, pincode, amount, assettype },
      ctx: { user },
    }) => {
      const asset = await getAssetDetail({ address, assettype });

      // Input format for collateral updates
      const collateralInput = {
        amount: parseUnits(amount.toString(), asset.decimals).toString(),
      };

      // Common parameters for collateral update mutations
      const params = {
        address,
        from: user.wallet,
        input: collateralInput,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case "stablecoin": {
          const response = await portalClient.request(
            StableCoinUpdateCollateral,
            params
          );
          return safeParse(t.Hashes(), [
            response.StableCoinUpdateCollateral?.transactionHash,
          ]);
        }
        case "tokenizeddeposit": {
          const response = await portalClient.request(
            TokenizedDepositUpdateCollateral,
            params
          );
          return safeParse(t.Hashes(), [
            response.TokenizedDepositUpdateCollateral?.transactionHash,
          ]);
        }
        default:
          throw new Error("Invalid asset type for collateral update");
      }
    }
  );
