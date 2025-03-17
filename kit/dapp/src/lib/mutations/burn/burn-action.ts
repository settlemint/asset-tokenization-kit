"use server";

import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../safe-action";
import { BurnSchema } from "./burn-schema";

/**
 * GraphQL mutation for burning bond tokens
 */
const BondBurn = portalGraphql(`
  mutation BondBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    BondBurn(
      address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for burning equity tokens
 */
const EquityBurn = portalGraphql(`
  mutation EquityBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    EquityBurn(
      address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for burning fund tokens
 */
const FundBurn = portalGraphql(`
  mutation FundBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    FundBurn(
      address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for burning stablecoin tokens
 */
const StableCoinBurn = portalGraphql(`
  mutation StableCoinBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    StableCoinBurn(
      address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for burning tokenized deposit tokens
 */
const TokenizedDepositBurn = portalGraphql(`
  mutation TokenizedDepositBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    TokenizedDepositBurn(
      address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const burn = action
  .schema(BurnSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, amount, assettype },
      ctx: { user },
    }) => {
      // Get token details based on asset type
      const { decimals } = await getAssetDetail({
        address,
        assettype,
      });

      // Common parameters for all mutations
      const params = {
        address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case "bond": {
          const response = await portalClient.request(BondBurn, params);
          return safeParseTransactionHash([response.BondBurn?.transactionHash]);
        }
        case "cryptocurrency": {
          throw new Error("Cryptocurrency does not support burn operations");
        }
        case "equity": {
          const response = await portalClient.request(EquityBurn, params);
          return safeParseTransactionHash([
            response.EquityBurn?.transactionHash,
          ]);
        }
        case "fund": {
          const response = await portalClient.request(FundBurn, params);
          return safeParseTransactionHash([response.FundBurn?.transactionHash]);
        }
        case "stablecoin": {
          const response = await portalClient.request(StableCoinBurn, params);
          return safeParseTransactionHash([
            response.StableCoinBurn?.transactionHash,
          ]);
        }
        case "tokenizeddeposit": {
          const response = await portalClient.request(
            TokenizedDepositBurn,
            params
          );
          return z
            .hashes()
            .parse([response.TokenizedDepositBurn?.transactionHash]);
        }
        default:
          throw new Error("Invalid asset type");
      }
    }
  );
