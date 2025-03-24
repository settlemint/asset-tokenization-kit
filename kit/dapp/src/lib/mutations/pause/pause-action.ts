"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { PauseSchema } from "./pause-schema";

/**
 * GraphQL mutation for pausing a bond contract
 */
const BondPause = portalGraphql(`
  mutation BondPause($address: String!, $from: String!, $challengeResponse: String!) {
    BondPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for pausing an equity contract
 */
const EquityPause = portalGraphql(`
  mutation EquityPause($address: String!, $from: String!, $challengeResponse: String!) {
    EquityPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for pausing a fund contract
 */
const FundPause = portalGraphql(`
  mutation FundPause($address: String!, $from: String!, $challengeResponse: String!) {
    FundPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for pausing a stablecoin contract
 */
const StableCoinPause = portalGraphql(`
  mutation StableCoinPause($address: String!, $from: String!, $challengeResponse: String!) {
    StableCoinPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for pausing a tokenized deposit contract
 */
const TokenizedDepositPause = portalGraphql(`
  mutation TokenizedDepositPause($address: String!, $from: String!, $challengeResponse: String!) {
    TokenizedDepositPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const pause = action
  .schema(PauseSchema())
  .outputSchema(t.Hashes())
  .action(
    async ({ parsedInput: { address, pincode, assettype }, ctx: { user } }) => {
      // Common parameters for all mutations
      const params = {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case "bond": {
          const response = await portalClient.request(BondPause, params);
          return safeParse(t.Hashes(), [response.BondPause?.transactionHash]);
        }
        case "cryptocurrency": {
          throw new Error("Cryptocurrency does not support pause operations");
        }
        case "equity": {
          const response = await portalClient.request(EquityPause, params);
          return safeParse(t.Hashes(), [response.EquityPause?.transactionHash]);
        }
        case "fund": {
          const response = await portalClient.request(FundPause, params);
          return safeParse(t.Hashes(), [response.FundPause?.transactionHash]);
        }
        case "stablecoin": {
          const response = await portalClient.request(StableCoinPause, params);
          return safeParse(t.Hashes(), [
            response.StableCoinPause?.transactionHash,
          ]);
        }
        case "tokenizeddeposit": {
          const response = await portalClient.request(
            TokenizedDepositPause,
            params
          );
          return safeParse(t.Hashes(), [
            response.TokenizedDepositPause?.transactionHash,
          ]);
        }
        default:
          throw new Error("Invalid asset type");
      }
    }
  );
