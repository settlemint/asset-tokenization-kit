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

export const blockUser = action
  .schema(BlockUserSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, account, assettype },
      ctx: { user },
    }) => {
      // Common parameters for all mutations
      const params = {
        address,
        account,
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
        case "cryptocurrency": {
          throw new Error(
            "Cryptocurrency does not support block user operations"
          );
        }
        case "equity": {
          throw new Error("Equity does not support block user operations");
        }
        case "fund": {
          throw new Error("Fund does not support block user operations");
        }
        case "stablecoin": {
          throw new Error("Stablecoin does not support block user operations");
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
