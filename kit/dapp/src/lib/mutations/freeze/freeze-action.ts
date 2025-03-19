"use server";

import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../safe-action";
import { FreezeSchema } from "./freeze-schema";

/**
 * GraphQL mutation to freeze a specific user account from a bond
 */
const BondFreeze = portalGraphql(`
  mutation BondFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    BondFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to freeze a specific user account from an equity
 */
const EquityFreeze = portalGraphql(`
  mutation EquityFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    EquityFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to freeze a specific user account from a fund
 */
const FundFreeze = portalGraphql(`
  mutation FundFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    FundFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to freeze a specific user account from a stablecoin
 */
const StableCoinFreeze = portalGraphql(`
  mutation StableCoinFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    StableCoinFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to freeze a specific user account from a tokenized deposit
 */
const TokenizedDepositFreeze = portalGraphql(`
  mutation TokenizedDepositFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    TokenizedDepositFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const freeze = action
  .schema(FreezeSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, userAddress, amount, assettype },
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
        user: userAddress,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case "bond": {
          const response = await portalClient.request(BondFreeze, params);
          return safeParseTransactionHash([
            response.BondFreeze?.transactionHash,
          ]);
        }
        case "cryptocurrency": {
          throw new Error("Cryptocurrency does not support freeze operations");
        }
        case "equity": {
          const response = await portalClient.request(EquityFreeze, params);
          return safeParseTransactionHash([
            response.EquityFreeze?.transactionHash,
          ]);
        }
        case "fund": {
          const response = await portalClient.request(FundFreeze, params);
          return safeParseTransactionHash([
            response.FundFreeze?.transactionHash,
          ]);
        }
        case "stablecoin": {
          const response = await portalClient.request(StableCoinFreeze, params);
          return safeParseTransactionHash([
            response.StableCoinFreeze?.transactionHash,
          ]);
        }
        case "tokenizeddeposit": {
          const response = await portalClient.request(
            TokenizedDepositFreeze,
            params
          );
          return safeParseTransactionHash([
            response.TokenizedDepositFreeze?.transactionHash,
          ]);
        }
        default:
          throw new Error("Invalid asset type");
      }
    }
  );
