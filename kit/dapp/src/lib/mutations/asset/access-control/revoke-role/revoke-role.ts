"use server";

import { handleChallenge } from "@/lib/challenge";
import { type Role, getRoleIdentifier } from "@/lib/config/roles";
import { action } from "@/lib/mutations/safe-action";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { RevokeRoleSchema } from "./revoke-role-schema";

/**
 * GraphQL mutation for revoking a role from a user for a bond
 *
 * @remarks
 * Removes permissions from an account for interacting with the bond
 */
const BondRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: BondRevokeRoleInput!) {
    BondRevokeRole(
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
const CryptoCurrencyRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: CryptoCurrencyRevokeRoleInput!) {
    CryptoCurrencyRevokeRole(
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
const StableCoinRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: StableCoinRevokeRoleInput!) {
    StableCoinRevokeRole(
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
const FundRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: FundRevokeRoleInput!) {
    FundRevokeRole(
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
const EquityRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: EquityRevokeRoleInput!) {
    EquityRevokeRole(
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
 * GraphQL mutation for revoking a role from a user for a tokenized deposit
 *
 * @remarks
 * Removes permissions from an account for interacting with the tokenized deposit
 */
const TokenizedDepositRevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: TokenizedDepositRevokeRoleInput!) {
    TokenizedDepositRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const revokeRole = action
  .schema(RevokeRoleSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, roles, userAddress, pincode, assettype },
      ctx: { user },
    }) => {
      const revokeRoleFn = async (role: Role) => {
        const params = {
          address: address,
          from: user.wallet,
          input: {
            role: getRoleIdentifier(role),
            account: userAddress,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
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
            const response = await portalClient.request(
              EquityRevokeRole,
              params
            );
            return response.EquityRevokeRole?.transactionHash;
          }
          case "tokenizeddeposit": {
            const response = await portalClient.request(
              TokenizedDepositRevokeRole,
              params
            );
            return response.TokenizedDepositRevokeRole?.transactionHash;
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

      return safeParseWithLogging(z.hashes(), results);
    }
  );
