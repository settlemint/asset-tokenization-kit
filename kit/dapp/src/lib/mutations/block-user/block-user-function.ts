import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { BlockUserInput } from "./block-user-schema";

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

const StableCoinBlockUser = portalGraphql(`
  mutation StableCoinBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    StableCoinBlockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

const EquityBlockUser = portalGraphql(`
  mutation EquityBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    EquityBlockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

const FundBlockUser = portalGraphql(`
  mutation FundBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    FundBlockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

/**
 * Function to block a user from accessing an asset
 *
 * @param input - Validated input for blocking the user
 * @param user - The user blocking access
 * @returns The transaction hash
 */
export async function blockUserFunction({
  parsedInput: { address, pincode, userAddress, assettype },
  ctx: { user },
}: {
  parsedInput: BlockUserInput;
  ctx: { user: User };
}) {
  // Common parameters for all mutations
  const params = {
    address,
    account: userAddress,
    from: user.wallet,
    challengeResponse: await handleChallenge(user.wallet, pincode),
  };

  switch (assettype) {
    case "bond": {
      const response = await portalClient.request(BondBlockUser, params);
      return safeParse(t.Hashes(), [response.BondBlockUser?.transactionHash]);
    }
    case "equity": {
      const response = await portalClient.request(EquityBlockUser, params);
      return safeParse(t.Hashes(), [response.EquityBlockUser?.transactionHash]);
    }
    case "fund": {
      const response = await portalClient.request(FundBlockUser, params);
      return safeParse(t.Hashes(), [response.FundBlockUser?.transactionHash]);
    }
    case "stablecoin": {
      const response = await portalClient.request(StableCoinBlockUser, params);
      return safeParse(t.Hashes(), [
        response.StableCoinBlockUser?.transactionHash,
      ]);
    }
    case "cryptocurrency": {
      throw new Error("Cryptocurrency does not support block user operations");
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
