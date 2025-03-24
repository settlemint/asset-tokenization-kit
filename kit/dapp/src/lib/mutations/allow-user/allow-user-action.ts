"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { AllowUserSchema } from "./allow-user-schema";

/**
 * GraphQL mutation to allow a user to a tokenized deposit
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
  .schema(AllowUserSchema())
  .outputSchema(t.Hashes())
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
          return safeParse(t.Hashes(), [
            response.TokenizedDepositAllowUser?.transactionHash,
          ]);
        }
        default:
          throw new Error("Asset type does not support allow user operations");
      }
    }
  );
