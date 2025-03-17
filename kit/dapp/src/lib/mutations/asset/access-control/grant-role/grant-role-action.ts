'use server';
import { handleChallenge } from '@/lib/challenge';
import { type Role, getRoleIdentifier } from '@/lib/config/roles';
import { action } from '@/lib/mutations/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { safeParseWithLogging, z } from '@/lib/utils/zod';
import { GrantRoleSchema } from './grant-role-schema';

/**
 * GraphQL mutation for granting a role to a user for a stablecoin
 *
 * @remarks
 * Assigns permissions to an account for interacting with the stablecoin
 */
const StableCoinGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: StableCoinGrantRoleInput!) {
    GrantRole: StableCoinGrantRole(
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
 * GraphQL mutation for granting a role to a user for a bond
 *
 * @remarks
 * Assigns permissions to an account for interacting with the bond
 */
const BondGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: BondGrantRoleInput!) {
    GrantRole: BondGrantRole(
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
 * GraphQL mutation for granting a role to a user for a cryptocurrency
 *
 * @remarks
 * Assigns permissions to an account for interacting with the cryptocurrency
 */
const CryptoCurrencyGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: CryptoCurrencyGrantRoleInput!) {
    GrantRole: CryptoCurrencyGrantRole(
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
 * GraphQL mutation for granting a role to a user for a fund
 *
 * @remarks
 * Assigns permissions to an account for interacting with the fund
 */
const FundGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: FundGrantRoleInput!) {
    GrantRole: FundGrantRole(
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
 * GraphQL mutation for granting a role to a user for a equity
 *
 * @remarks
 * Assigns permissions to an account for interacting with the equity
 */
const EquityGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: EquityGrantRoleInput!) {
    GrantRole: EquityGrantRole(
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
 * GraphQL mutation for granting a role to a user for a tokenized deposit
 *
 * @remarks
 * Assigns permissions to an account for interacting with the tokenized deposit
 */
const TokenizedDepositGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: TokenizedDepositGrantRoleInput!) {
    GrantRole: TokenizedDepositGrantRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const grantRole = action
  .schema(GrantRoleSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, roles, userAddress, pincode, assettype },
      ctx: { user },
    }) => {
      const grantRoleFn = async (role: Role) => {
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
          case 'stablecoin': {
            const response = await portalClient.request(
              StableCoinGrantRole,
              params
            );
            return response.GrantRole?.transactionHash;
          }
          case 'bond': {
            const response = await portalClient.request(BondGrantRole, params);
            return response.GrantRole?.transactionHash;
          }
          case 'cryptocurrency': {
            const response = await portalClient.request(
              CryptoCurrencyGrantRole,
              params
            );
            return response.GrantRole?.transactionHash;
          }
          case 'fund': {
            const response = await portalClient.request(FundGrantRole, params);
            return response.GrantRole?.transactionHash;
          }
          case 'equity': {
            const response = await portalClient.request(
              EquityGrantRole,
              params
            );
            return response.GrantRole?.transactionHash;
          }
          case 'tokenizeddeposit': {
            const response = await portalClient.request(
              TokenizedDepositGrantRole,
              params
            );
            return response.GrantRole?.transactionHash;
          }
          default:
            throw new Error(`Unsupported asset type: ${assettype}`);
        }
      };

      const selectedRoles = Object.entries(roles)
        .filter(([, enabled]) => enabled)
        .map(([role]) => role as Role);
      const grantPromises = selectedRoles.map((role) => grantRoleFn(role));
      const results = await Promise.all(grantPromises);
      const transactions = results.filter(Boolean) as string[];

      return safeParseWithLogging(z.hashes(), transactions);
    }
  );
