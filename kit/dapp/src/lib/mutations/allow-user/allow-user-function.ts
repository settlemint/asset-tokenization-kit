import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { AllowUserInput } from "./allow-user-schema";

/**
 * GraphQL mutation to allow a user to a tokenized deposit
 */
const DepositAllowUser = portalGraphql(`
  mutation DepositAllowUser($address: String!, $user: String!, $from: String!, $challengeResponse: String!) {
    DepositAllowUser(
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
 * Function to allow a user to access an asset
 *
 * @param input - Validated input for allowing the user
 * @param user - The user authorizing access
 * @returns The transaction hash
 */
export async function allowUserFunction({
  parsedInput: { address, pincode, userAddress, assettype },
  ctx: { user },
}: {
  parsedInput: AllowUserInput;
  ctx: { user: User };
}) {
  // Common parameters for all mutations
  const params = {
    address,
    user: userAddress,
    from: user.wallet,
    challengeResponse: await handleChallenge(user.wallet, pincode),
  };

  switch (assettype) {
    case "deposit": {
      const response = await portalClient.request(DepositAllowUser, params);
      return safeParse(t.Hashes(), [
        response.DepositAllowUser?.transactionHash,
      ]);
    }
    default:
      throw new Error("Asset type does not support allow user operations");
  }
}
