"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { MatureFormSchema } from "./mature-schema";

/**
 * GraphQL mutation for maturing a bond
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const MatureBond = portalGraphql(`
  mutation MatureBond(
    $address: String!,
    $from: String!,
    $challengeResponse: String!
  ) {
    BondMature(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const mature = action
  .schema(MatureFormSchema)
  .outputSchema(z.hashes())
  .action(async ({ parsedInput: { address, pincode }, ctx: { user } }) => {
    const response = await portalClient.request(MatureBond, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet, pincode),
    });

    return safeParseTransactionHash([response.BondMature?.transactionHash]);
  });
