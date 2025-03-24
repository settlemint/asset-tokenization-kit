import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { type Role, getRoleIdentifier } from "@/lib/config/roles";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { GrantRoleInput } from "./grant-role-schema";

/**
 * GraphQL mutation for granting a role to a user for a stablecoin
 *
 * @remarks
 * Assigns permissions to an account for interacting with the stablecoin
 */
const StableCoinGrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: StableCoinGrantRoleInput!) {
    StableCoinGrantRole(
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
    BondGrantRole(
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
    CryptoCurrencyGrantRole(
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
    FundGrantRole(
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
    EquityGrantRole(
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
    TokenizedDepositGrantRole(
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
 * Function to grant roles to a user for an asset
 *
 * @param input - Validated input for granting roles
 * @param user - The user granting the roles
 * @returns Array of transaction hashes
 */
export async function grantRoleFunction({
  parsedInput: { address, roles, userAddress, pincode, assettype },
  ctx: { user },
}: {
  parsedInput: GrantRoleInput;
  ctx: { user: User };
}) {
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
      case "tokenizeddeposit": {
        const response = await portalClient.request(
          TokenizedDepositGrantRole,
          params
        );
        return response.TokenizedDepositGrantRole?.transactionHash;
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
