import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { type Role, getRoleIdentifier } from "@/lib/config/roles";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { RevokeRoleInput } from "./revoke-role-schema";

/**
 * GraphQL mutation for revoking a role from a user for a bond
 *
 * @remarks
 * Removes permissions from an account for interacting with the bond
 */
const BondRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $verificationId: String, $input: BondRevokeRoleInput!) {
    BondRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for revoking a role from a user for a cryptocurrency
 *
 * @remarks
 * Removes permissions from an account for interacting with the cryptocurrency
 */
const CryptoCurrencyRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $verificationId: String, $input: CryptoCurrencyRevokeRoleInput!) {
    CryptoCurrencyRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for revoking a role from a user for a stablecoin
 *
 * @remarks
 * Removes permissions from an account for interacting with the stablecoin
 */
const StableCoinRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $verificationId: String, $input: StableCoinRevokeRoleInput!) {
    StableCoinRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for revoking a role from a user for a fund
 *
 * @remarks
 * Removes permissions from an account for interacting with the fund
 */
const FundRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $verificationId: String, $input: FundRevokeRoleInput!) {
    FundRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for revoking a role from a user for a equity
 *
 * @remarks
 * Removes permissions from an account for interacting with the equity
 */
const EquityRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $verificationId: String, $input: EquityRevokeRoleInput!) {
    EquityRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for revoking a role from a user for a tokenized deposit
 *
 * @remarks
 * Removes permissions from an account for interacting with the tokenized deposit
 */
const DepositRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $verificationId: String, $input: DepositRevokeRoleInput!) {
    DepositRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to revoke roles from a user for an asset
 *
 * @param input - Validated input for revoking roles
 * @param user - The user revoking the roles
 * @returns Array of transaction hashes
 */
export const revokeRoleFunction = withAccessControl(
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
    parsedInput: RevokeRoleInput;
    ctx: { user: User };
  }) => {
    const revokeRoleFn = async (role: Role) => {
      const params: VariablesOf<
        | typeof DepositRevokeRole
        | typeof StableCoinRevokeRole
        | typeof BondRevokeRole
        | typeof CryptoCurrencyRevokeRole
        | typeof FundRevokeRole
        | typeof EquityRevokeRole
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
            StableCoinRevokeRole,
            params
          );
          return response.StableCoinRevokeRole?.transactionHash;
        }
        case "bond": {
          const response = await portalClient.request(BondRevokeRole, params);
          return response.BondRevokeRole?.transactionHash;
        }
        case "cryptocurrency": {
          const response = await portalClient.request(
            CryptoCurrencyRevokeRole,
            params
          );
          return response.CryptoCurrencyRevokeRole?.transactionHash;
        }
        case "fund": {
          const response = await portalClient.request(FundRevokeRole, params);
          return response.FundRevokeRole?.transactionHash;
        }
        case "equity": {
          const response = await portalClient.request(EquityRevokeRole, params);
          return response.EquityRevokeRole?.transactionHash;
        }
        case "deposit": {
          const response = await portalClient.request(
            DepositRevokeRole,
            params
          );
          return response.DepositRevokeRole?.transactionHash;
        }
        default:
          throw new Error("Unsupported asset type");
      }
    };

    const selectedRoles = Object.entries(roles)
      .filter(([, enabled]) => enabled)
      .map(([role]) => role as Role);
    const revokePromises = selectedRoles.map((role) => revokeRoleFn(role));
    const results = await Promise.all(revokePromises);

    return safeParse(t.Hashes(), results);
  }
);
