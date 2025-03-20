"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { action } from "../safe-action";
import { AllowUserSchema } from "./allow-user-schema";

/**
 * GraphQL mutation to disallow a user from a tokenized deposit
 */
const TokenizedDepositAllowUser = portalGraphql(`
  mutation TokenizedDepositAllowUser($address: String!, $user: String!, $from: String!, $challengeResponse: String!) {
    TokenizedDepositAllowUser(
      address: $address
      input: { user: $user }
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const allowUser = action
  .schema(AllowUserSchema)
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
            TokenizedDepositAllowUser,
            params
          );
          return safeParseTransactionHash([
            response.TokenizedDepositAllowUser?.transactionHash,
          ]);
        }
        default:
          throw new Error("Asset type does not support allow user operations");
      }
    }
  );
