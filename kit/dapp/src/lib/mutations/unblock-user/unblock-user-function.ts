import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { UnblockUserInput } from "./unblock-user-schema";

/**
 * GraphQL mutation to unblock a user from a bond token
 */
const BondUnblockUser = portalGraphql(`
  mutation BondUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    BondUnblockUser(
      address: $address
      input: { user: $account }
      from: $from
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to unblock a user from a stablecoin token
 */
const StableCoinUnblockUser = portalGraphql(`
  mutation StableCoinUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    StableCoinUnblockUser(
      address: $address
      input: { user: $account }
      from: $from
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to unblock a user from an equity token
 */
const EquityUnblockUser = portalGraphql(`
  mutation EquityUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    EquityUnblockUser(
      address: $address
      input: { user: $account }
      from: $from
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to unblock a user from a fund token
 */
const FundUnblockUser = portalGraphql(`
  mutation FundUnblockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    FundUnblockUser(
      address: $address
      input: { user: $account }
      from: $from
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to unblock a user from a token
 *
 * @param input - Validated input containing address, verificationCode, userAddress, and assettype
 * @param user - The user executing the unblock operation
 * @returns Array of transaction hashes
 */
export const unblockUserFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      address,
      verificationCode,
      verificationType,
      userAddress,
      assettype,
    },
    ctx: { user },
  }: {
    parsedInput: UnblockUserInput;
    ctx: { user: User };
  }) => {
    // Common parameters for all mutations
    const params: VariablesOf<
      | typeof BondUnblockUser
      | typeof StableCoinUnblockUser
      | typeof EquityUnblockUser
      | typeof FundUnblockUser
    > = {
      address,
      account: userAddress,
      from: user.wallet,
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    };

    switch (assettype) {
      case "bond": {
        const response = await portalClient.request(BondUnblockUser, params);
        return safeParse(t.Hashes(), [
          response.BondUnblockUser?.transactionHash,
        ]);
      }
      case "equity": {
        const response = await portalClient.request(EquityUnblockUser, params);
        return safeParse(t.Hashes(), [
          response.EquityUnblockUser?.transactionHash,
        ]);
      }
      case "fund": {
        const response = await portalClient.request(FundUnblockUser, params);
        return safeParse(t.Hashes(), [
          response.FundUnblockUser?.transactionHash,
        ]);
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
);
