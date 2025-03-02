"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { BlockUserSchema } from "./block-user-schema";

/**
 * GraphQL mutation to block a user from a equity
 *
 * @remarks
 * This adds an address to the blocklist of the equity
 */
const EquityBlockUser = portalGraphql(`
  mutation EquityBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    EquityBlockUser(
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
    async ({ parsedInput: { address, pincode, account }, ctx: { user } }) => {
      const response = await portalClient.request(EquityBlockUser, {
        address: address,
        account,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.EquityBlockUser?.transactionHash]);
    }
  );
