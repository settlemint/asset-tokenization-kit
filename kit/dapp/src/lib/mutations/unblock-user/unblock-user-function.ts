import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { UnblockUserInput } from "./unblock-user-schema";

/**
 * GraphQL mutation to unblock a user from a bond token
 */
const BondUnblockUser = portalGraphql(`
  mutation BondUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    BondUnblockUser(
      address: $address
      input: { user: $account }
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to unblock a user from a stablecoin token
 */
const StableCoinUnblockUser = portalGraphql(`
  mutation StableCoinUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    StableCoinUnblockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to unblock a user from an equity token
 */
const EquityUnblockUser = portalGraphql(`
  mutation EquityUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    EquityUnblockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to unblock a user from a fund token
 */
const FundUnblockUser = portalGraphql(`
  mutation FundUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!) {
    FundUnblockUser(address: $address, input: { user: $account }, from: $from, challengeResponse: $challengeResponse) {
      transactionHash
    }
  }
`);

/**
 * Function to unblock a user from a token
 *
 * @param input - Validated input containing address, pincode, userAddress, and assettype
 * @param user - The user executing the unblock operation
 * @returns Array of transaction hashes
 */
export async function unblockUserFunction({
  parsedInput: { address, pincode, userAddress, assettype },
  ctx: { user },
}: {
  parsedInput: UnblockUserInput;
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
      const response = await portalClient.request(BondUnblockUser, params);
      return safeParse(t.Hashes(), [response.BondUnblockUser?.transactionHash]);
    }
    case "equity": {
      const response = await portalClient.request(EquityUnblockUser, params);
      return safeParse(t.Hashes(), [
        response.EquityUnblockUser?.transactionHash,
      ]);
    }
    case "fund": {
      const response = await portalClient.request(FundUnblockUser, params);
      return safeParse(t.Hashes(), [response.FundUnblockUser?.transactionHash]);
    }
    case "stablecoin": {
      const response = await portalClient.request(
        StableCoinUnblockUser,
        params
      );
      return safeParse(t.Hashes(), [
        response.StableCoinUnblockUser?.transactionHash,
      ]);
    }
    case "cryptocurrency": {
      throw new Error(
        "Cryptocurrency does not support unblock user operations"
      );
    }
    case "deposit": {
      throw new Error("Deposit does not support unblock user operations");
    }
    default:
      throw new Error("Invalid asset type");
  }
}
