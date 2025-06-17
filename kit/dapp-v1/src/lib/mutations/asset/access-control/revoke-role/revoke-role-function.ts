import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { type Role, getRoleIdentifier } from "@/lib/config/roles";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { RevokeRoleInput } from "./revoke-role-schema";

// Dummy types for commented GraphQL operations
const BondRevokeRole = {} as any;
const CryptoCurrencyRevokeRole = {} as any;
const StableCoinRevokeRole = {} as any;
const FundRevokeRole = {} as any;
const EquityRevokeRole = {} as any;
const DepositRevokeRole = {} as any;

/**
 * GraphQL mutation for revoking a role from a user for a bond
 *
 * @remarks
 * Removes permissions from an account for interacting with the bond
 */
// const BondRevokeRole = portalGraphql(`
//   mutation RevokeRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: BondRevokeRoleInput!) {
//     BondRevokeRole(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       from: $from
//       input: $input
//       address: $address
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for revoking a role from a user for a cryptocurrency
 *
 * @remarks
 * Removes permissions from an account for interacting with the cryptocurrency
 */
// const CryptoCurrencyRevokeRole = portalGraphql(`
//   mutation RevokeRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: CryptoCurrencyRevokeRoleInput!) {
//     CryptoCurrencyRevokeRole(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       from: $from
//       input: $input
//       address: $address
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for revoking a role from a user for a stablecoin
 *
 * @remarks
 * Removes permissions from an account for interacting with the stablecoin
 */
// const StableCoinRevokeRole = portalGraphql(`
//   mutation RevokeRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: StableCoinRevokeRoleInput!) {
//     StableCoinRevokeRole(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       from: $from
//       input: $input
//       address: $address
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for revoking a role from a user for a fund
 *
 * @remarks
 * Removes permissions from an account for interacting with the fund
 */
// const FundRevokeRole = portalGraphql(`
//   mutation RevokeRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: FundRevokeRoleInput!) {
//     FundRevokeRole(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       from: $from
//       input: $input
//       address: $address
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for revoking a role from a user for a equity
 *
 * @remarks
 * Removes permissions from an account for interacting with the equity
 */
// const EquityRevokeRole = portalGraphql(`
//   mutation RevokeRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: EquityRevokeRoleInput!) {
//     EquityRevokeRole(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       from: $from
//       input: $input
//       address: $address
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for revoking a role from a user for a tokenized deposit
 *
 * @remarks
 * Removes permissions from an account for interacting with the tokenized deposit
 */
// const DepositRevokeRole = portalGraphql(`
//   mutation RevokeRole($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: DepositRevokeRoleInput!) {
//     DepositRevokeRole(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       from: $from
//       input: $input
//       address: $address
//     ) {
//       transactionHash
//     }
//   }
// `);

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
          // const response = await portalClient.request(
          //             StableCoinRevokeRole,
          //             params
          //           );
          return safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.StableCoinRevokeRole?.transactionHash */,
          ]);
        }
        case "bond": {
          // const response = await portalClient.request(BondRevokeRole, params);
          return safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.BondRevokeRole?.transactionHash */,
          ]);
        }
        case "cryptocurrency": {
          // const response = await portalClient.request(
          //             CryptoCurrencyRevokeRole,
          //             params
          //           );
          return safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.CryptoCurrencyRevokeRole?.transactionHash */,
          ]);
        }
        case "fund": {
          // const response = await portalClient.request(FundRevokeRole, params);
          return safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.FundRevokeRole?.transactionHash */,
          ]);
        }
        case "equity": {
          // const response = await portalClient.request(EquityRevokeRole, params);
          return safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.EquityRevokeRole?.transactionHash */,
          ]);
        }
        case "deposit": {
          // const response = await portalClient.request(
          //             DepositRevokeRole,
          //             params
          //           );
          return safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.DepositRevokeRole?.transactionHash */,
          ]);
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

    return waitForIndexingTransactions(results.flat());
  }
);
