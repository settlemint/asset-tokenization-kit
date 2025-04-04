import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { BlockUserInput } from "./block-user-schema";

/**
 * GraphQL mutation to block a user from a bond
 */
/**
 * GraphQL mutation for blocking a user from a bond
 *
 * @remarks
 * Prevents a user from interacting with the bond
 */
const BondBlockUser = portalGraphql(`
  mutation BondBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    BondBlockUser(
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
 * GraphQL mutation for blocking a user from a stablecoin
 *
 * @remarks
 * Prevents a user from interacting with the stablecoin
 */
const StableCoinBlockUser = portalGraphql(`
  mutation StableCoinBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    StableCoinBlockUser(
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
 * GraphQL mutation for blocking a user from an equity
 *
 * @remarks
 * Prevents a user from interacting with the equity
 */
const EquityBlockUser = portalGraphql(`
  mutation EquityBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    EquityBlockUser(
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
 * GraphQL mutation for blocking a user from a fund
 *
 * @remarks
 * Prevents a user from interacting with the fund
 */
const FundBlockUser = portalGraphql(`
  mutation FundBlockUser($address: String!, $account: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    FundBlockUser(
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
 * Function to block a user from accessing an asset
 *
 * @param input - Validated input for blocking the user
 * @param user - The user blocking access
 * @returns The transaction hash
 */
export const blockUserFunction = withAccessControl(
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
    parsedInput: BlockUserInput;
    ctx: { user: User };
  }) => {
    // Common parameters for all mutations
    const params: VariablesOf<
      | typeof BondBlockUser
      | typeof StableCoinBlockUser
      | typeof EquityBlockUser
      | typeof FundBlockUser
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
        const response = await portalClient.request(BondBlockUser, params);
        return safeParse(t.Hashes(), [response.BondBlockUser?.transactionHash]);
      }
      case "equity": {
        const response = await portalClient.request(EquityBlockUser, params);
        return safeParse(t.Hashes(), [
          response.EquityBlockUser?.transactionHash,
        ]);
      }
      case "fund": {
        const response = await portalClient.request(FundBlockUser, params);
        return safeParse(t.Hashes(), [response.FundBlockUser?.transactionHash]);
      }
      case "stablecoin": {
        const response = await portalClient.request(
          StableCoinBlockUser,
          params
        );
        return safeParse(t.Hashes(), [
          response.StableCoinBlockUser?.transactionHash,
        ]);
      }
      case "cryptocurrency": {
        throw new Error(
          "Cryptocurrency does not support block user operations"
        );
      }
      case "deposit": {
        throw new Error("Deposit does not support block user operations");
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);
