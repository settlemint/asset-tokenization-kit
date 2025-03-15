"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { UnPauseSchema } from "./unpause-schema";

/**
 * GraphQL mutation for unpausing a stablecoin contract
 *
 * @remarks
 * Resumes normal operations on a previously paused stablecoin
 */
const TokenizedDepositUnPause = portalGraphql(`
  mutation TokenizedDepositUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    TokenizedDepositUnpause(
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
    const response = await portalClient.request(TokenizedDepositUnPause, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet, pincode),
    });

    return z
      .hashes()
      .parse([response.TokenizedDepositUnpause?.transactionHash]);
  });
