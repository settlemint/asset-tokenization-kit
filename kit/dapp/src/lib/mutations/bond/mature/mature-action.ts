"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
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
  .schema(MatureFormSchema())
  .outputSchema(t.Hashes())
  .action(async ({ parsedInput: { address, pincode }, ctx: { user } }) => {
    const response = await portalClient.request(MatureBond, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet, pincode),
    });

    return safeParse(t.Hashes(), [response.BondMature?.transactionHash]);
  });
