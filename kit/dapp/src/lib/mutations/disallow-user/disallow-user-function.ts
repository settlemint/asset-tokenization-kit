import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { DisallowUserInput } from "./disallow-user-schema";

/**
 * GraphQL mutation to disallow a user from a tokenized deposit
 */
const DepositDisallowUser = portalGraphql(`
  mutation DepositDisallowUser($address: String!, $user: String!, $from: String!, $challengeResponse: String!) {
    DepositDisallowUser(
      address: $address
      input: { user: $user }
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to disallow a user from accessing a tokenized deposit
 *
 * @param input - Validated input containing address, pincode, userAddress, and assettype
 * @param user - The user executing the disallow operation
 * @returns Array of transaction hashes
 */
export const disallowUserFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: { address, pincode, userAddress, assettype },
    ctx: { user },
  }: {
    parsedInput: DisallowUserInput;
    ctx: { user: User };
  }) => {
    // Common parameters for all mutations
    const params = {
      address,
      user: userAddress,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet, pincode),
    };

    switch (assettype) {
      case "deposit": {
        const response = await portalClient.request(
          DepositDisallowUser,
          params
        );
        return safeParse(t.Hashes(), [
          response.DepositDisallowUser?.transactionHash,
        ]);
      }
      default:
        throw new Error("Asset type does not support disallow user operations");
    }
  }
);
