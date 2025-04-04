import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { type Role, getRoleIdentifier } from "@/lib/config/roles";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { GrantRoleInput } from "./grant-role-schema";

/**
 * GraphQL mutation for granting a role to a user for a stablecoin
 *
 * @remarks
 * Assigns permissions to an account for interacting with the stablecoin
 */
const StableCoinGrantRole = portalGraphql(`
  mutation GrantRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: StableCoinGrantRoleInput!) {
    StableCoinGrantRole(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a role to a user for a bond
 *
 * @remarks
 * Assigns permissions to an account for interacting with the bond
 */
const BondGrantRole = portalGraphql(`
  mutation GrantRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: BondGrantRoleInput!) {
    BondGrantRole(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a role to a user for a cryptocurrency
 *
 * @remarks
 * Assigns permissions to an account for interacting with the cryptocurrency
 */
const CryptoCurrencyGrantRole = portalGraphql(`
  mutation GrantRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: CryptoCurrencyGrantRoleInput!) {
    CryptoCurrencyGrantRole(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a role to a user for a fund
 *
 * @remarks
 * Assigns permissions to an account for interacting with the fund
 */
const FundGrantRole = portalGraphql(`
  mutation GrantRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: FundGrantRoleInput!) {
    FundGrantRole(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a role to a user for a equity
 *
 * @remarks
 * Assigns permissions to an account for interacting with the equity
 */
const EquityGrantRole = portalGraphql(`
  mutation GrantRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: EquityGrantRoleInput!) {
    EquityGrantRole(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a role to a user for a tokenized deposit
 *
 * @remarks
 * Assigns permissions to an account for interacting with the tokenized deposit
 */
const DepositGrantRole = portalGraphql(`
  mutation GrantRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: DepositGrantRoleInput!) {
    DepositGrantRole(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      from: $from
      input: $input
      address: $address
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to grant roles to a user for an asset
 *
 * @param input - Validated input for granting roles
 * @param user - The user granting the roles
 * @returns Array of transaction hashes
 */
export const grantRoleFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      address,
      roles,
      userAddress,
      verificationCode,
      verificationType,
      assettype,
    },
    ctx: { user },
  }: {
    parsedInput: GrantRoleInput;
    ctx: { user: User };
  }) => {
    const grantRoleFn = async (role: Role) => {
      const params: VariablesOf<
        | typeof DepositGrantRole
        | typeof StableCoinGrantRole
        | typeof BondGrantRole
        | typeof CryptoCurrencyGrantRole
        | typeof FundGrantRole
        | typeof EquityGrantRole
      > = {
        address: address,
        from: user.wallet,
        input: {
          role: getRoleIdentifier(role),
          account: userAddress,
        },
        ...(await handleChallenge(
          user,
          user.wallet,
          verificationCode,
          verificationType
        )),
      };

      switch (assettype) {
        case "stablecoin": {
          const response = await portalClient.request(
            StableCoinGrantRole,
            params
          );
          return response.StableCoinGrantRole?.transactionHash;
        }
        case "bond": {
          const response = await portalClient.request(BondGrantRole, params);
          return response.BondGrantRole?.transactionHash;
        }
        case "cryptocurrency": {
          const response = await portalClient.request(
            CryptoCurrencyGrantRole,
            params
          );
          return response.CryptoCurrencyGrantRole?.transactionHash;
        }
        case "fund": {
          const response = await portalClient.request(FundGrantRole, params);
          return response.FundGrantRole?.transactionHash;
        }
        case "equity": {
          const response = await portalClient.request(EquityGrantRole, params);
          return response.EquityGrantRole?.transactionHash;
        }
        case "deposit": {
          const response = await portalClient.request(DepositGrantRole, params);
          return response.DepositGrantRole?.transactionHash;
        }
        default:
          throw new Error("Unsupported asset type");
      }
    };

    const selectedRoles = Object.entries(roles)
      .filter(([, enabled]) => enabled)
      .map(([role]) => role as Role);
    const grantPromises = selectedRoles.map((role) => grantRoleFn(role));
    const results = await Promise.all(grantPromises);

    return safeParse(t.Hashes(), results);
  }
);
