import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { MatureFormInput } from "./mature-schema";

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

/**
 * Function to mature a bond
 *
 * @param input - Validated input for maturing the bond
 * @param user - The user initiating the mature operation
 * @returns The transaction hash
 */
export async function matureFunction({
  parsedInput: { address, pincode },
  ctx: { user },
}: {
  parsedInput: MatureFormInput;
  ctx: { user: User };
}) {
  const response = await portalClient.request(MatureBond, {
    address: address,
    from: user.wallet,
    challengeResponse: await handleChallenge(user.wallet, pincode),
  });

  return safeParse(t.Hashes(), [response.BondMature?.transactionHash]);
}
