import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
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
export const matureFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: { address, verificationCode, verificationType },
    ctx: { user },
  }: {
    parsedInput: MatureFormInput;
    ctx: { user: User };
  }) => {
    const response = await portalClient.request(MatureBond, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(
        user.wallet,
        verificationCode,
        verificationType
      ),
    });

    return safeParse(t.Hashes(), [response.BondMature?.transactionHash]);
  }
);
