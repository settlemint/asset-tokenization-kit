"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { action } from "../safe-action";
import { DisallowUserSchema } from "./disallow-user-schema";

/**
 * GraphQL mutation to disallow a user from a tokenized deposit
 */
const TokenizedDepositDisallowUser = portalGraphql(`
  mutation TokenizedDepositDisallowUser($address: String!, $user: String!, $from: String!, $challengeResponse: String!) {
    TokenizedDepositDisallowUser(
      address: $address
      input: { user: $user }
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const disallowUser = action
  .schema(DisallowUserSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, userAddress, assettype },
      ctx: { user },
    }) => {
      // Common parameters for all mutations
      const params = {
        address,
        user: userAddress,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      };

      switch (assettype) {
        case "tokenizeddeposit": {
          const response = await portalClient.request(
            TokenizedDepositDisallowUser,
            params
          );
          return safeParseTransactionHash([
            response.TokenizedDepositDisallowUser?.transactionHash,
          ]);
        }
        default:
          throw new Error(
            "Asset type does not support disallow user operations"
          );
      }
    }
  );
