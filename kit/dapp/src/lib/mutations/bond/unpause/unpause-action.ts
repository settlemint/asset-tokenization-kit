"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { UnPauseSchema } from "./unpause-schema";

/**
 * GraphQL mutation for unpausing a bond contract
 *
 * @remarks
 * Resumes normal operations on a previously paused bond
 */
const BondUnPause = portalGraphql(`
  mutation BondUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    BondUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const unpause = action
  .schema(UnPauseSchema)
  .outputSchema(z.hashes())
  .action(async ({ parsedInput: { address, pincode }, ctx: { user } }) => {
    const response = await portalClient.request(BondUnPause, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet, pincode),
    });

    return z.hashes().parse([response.BondUnpause?.transactionHash]);
  });
