"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { action } from "../safe-action";
import { BlockUserSchema } from "./block-user-schema";

/**
 * GraphQL mutation to block a user from a bond
 */
const BondBlockUser = portalGraphql(`
  mutation BondBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    BondBlockUser(
      address: $address
      input: { user: $account }
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const StableCoinBlockUser = portalGraphql(`
  mutation StableCoinBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    StableCoinBlockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

const EquityBlockUser = portalGraphql(`
  mutation EquityBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    EquityBlockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

const FundBlockUser = portalGraphql(`
  mutation FundBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    FundBlockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

export const blockUser = action
  .schema(BlockUserSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, userAddress, assettype },
      ctx: { user },
    }) => {
      // Common parameters for all mutations
      const params = {
        address,
        account: userAddress,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case "bond": {
          const response = await portalClient.request(BondBlockUser, params);
          return safeParseTransactionHash([
            response.BondBlockUser?.transactionHash,
          ]);
        }
        case "equity": {
          const response = await portalClient.request(EquityBlockUser, params);
          return safeParseTransactionHash([
            response.EquityBlockUser?.transactionHash,
          ]);
        }
        case "fund": {
          const response = await portalClient.request(FundBlockUser, params);
          return safeParseTransactionHash([
            response.FundBlockUser?.transactionHash,
          ]);
        }
        case "stablecoin": {
          const response = await portalClient.request(
            StableCoinBlockUser,
            params
          );
          return safeParseTransactionHash([
            response.StableCoinBlockUser?.transactionHash,
          ]);
        }
        case "cryptocurrency": {
          throw new Error(
            "Cryptocurrency does not support block user operations"
          );
        }
        case "tokenizeddeposit": {
          throw new Error(
            "Tokenized deposit does not support block user operations"
          );
        }
        default:
          throw new Error("Invalid asset type");
      }
    }
  );
