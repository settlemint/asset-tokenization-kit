import { handleChallenge } from "@/lib/challenge";
import { getRoleIdentifier, type Role } from "@/lib/config/roles";
import { action } from "@/lib/mutations/safe-action";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type { ResultOf, VariablesOf } from "@settlemint/sdk-portal";
import { RevokeRoleSchema } from "./revoke-role-schema";

/**
 * GraphQL mutation for revoking a role from a user for a bond
 *
 * @remarks
 * Removes permissions from an account for interacting with the bond
 */
export const BondRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: BondRevokeRoleInput!) {
    RevokeRole: BondRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
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
export const CryptoCurrencyRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: CryptoCurrencyRevokeRoleInput!) {
    RevokeRole: CryptoCurrencyRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
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
export const StableCoinRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: StableCoinRevokeRoleInput!) {
    RevokeRole: StableCoinRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
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
export const FundRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: FundRevokeRoleInput!) {
    RevokeRole: FundRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
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
export const EquityRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: EquityRevokeRoleInput!) {
    RevokeRole: EquityRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

type RevokeRoleInput = VariablesOf<
  | typeof StableCoinRevokeRole
  | typeof BondRevokeRole
  | typeof CryptoCurrencyRevokeRole
  | typeof FundRevokeRole
  | typeof EquityRevokeRole
>;
type RevokeRoleOutput = ResultOf<
  | typeof StableCoinRevokeRole
  | typeof BondRevokeRole
  | typeof CryptoCurrencyRevokeRole
  | typeof FundRevokeRole
  | typeof EquityRevokeRole
>;

export type RevokeRoleMutation = TypedDocumentNode<
  RevokeRoleOutput,
  RevokeRoleInput
>;

export const getRevokeRoleAction = (revokeRoleMutation: RevokeRoleMutation) =>
  action
    .schema(RevokeRoleSchema)
    .outputSchema(z.hashes())
    .action(
      async ({
        parsedInput: { address, roles, userAddress, pincode },
        ctx: { user },
      }) => {
        const selectedRoles = Object.entries(roles)
          .filter(([, enabled]) => enabled)
          .map(([role]) => role as Role);

        // Create an array of promises for each role revocation request
        const revokePromises = selectedRoles.map(async (role) => {
          const response = await portalClient.request(revokeRoleMutation, {
            address: address,
            from: user.wallet,
            input: {
              role: getRoleIdentifier(role),
              account: userAddress,
            },
            challengeResponse: await handleChallenge(user.wallet, pincode),
          });

          return response.RevokeRole?.transactionHash;
        });

        // Execute all requests in parallel
        const results = await Promise.all(revokePromises);

        // Filter out any undefined values and return transaction hashes
        const transactions = results.filter(Boolean) as string[];

        return z.hashes().parse(transactions);
      }
    );
