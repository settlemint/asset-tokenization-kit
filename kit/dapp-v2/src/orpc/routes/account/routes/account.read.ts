import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import * as countries from "i18n-iso-countries";

/**
 * GraphQL query for retrieving SMART systems from TheGraph.
 *
 * This query fetches a paginated list of system contracts with support for:
 * - Offset-based pagination (skip/first)
 * - Configurable sort order (ascending/descending)
 * - Custom ordering by any system field
 *
 * Systems represent deployed SMART protocol instances that manage
 * tokenized assets and their associated compliance infrastructure.
 */
export const READ_ACCOUNT_QUERY = theGraphGraphql(`
query ReadAccountQuery($walletAddress: ID!) {
  account(id: $walletAddress) {
    id
    country
    identity {
      claims(where: {revoked: false}) {
        name
        values {
          key
          value
        }
      }
    }
  }
}
`);

/**
 * System listing route handler.
 *
 * Retrieves a paginated list of SMART system contracts from TheGraph indexer.
 * Systems are the core infrastructure contracts that manage tokenized assets,
 * compliance modules, identity registries, and access control within the SMART
 * protocol ecosystem.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission - available to admin, issuer, user, and auditor roles
 * Method: GET /systems
 *
 * @param input - List parameters including pagination and sorting options
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<System[]> - Array of system objects with their blockchain addresses
 *
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 *
 * @example
 * ```typescript
 * // Client usage:
 * const systems = await orpc.system.list.query({
 *   offset: 0,
 *   limit: 20,
 *   orderBy: 'deployedAt',
 *   orderDirection: 'desc'
 * });
 * ```
 */
export const read = onboardedRouter.account.read
  .use(theGraphMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { wallet } = input;

    // Execute TheGraph query with pagination and sorting parameters
    const { account } = await context.theGraphClient.request(
      READ_ACCOUNT_QUERY,
      {
        walletAddress: wallet,
      }
    );

    if (!account) {
      throw errors.NOT_FOUND({
        message: "Account not found",
      });
    }

    let countryAlpha2: string | undefined;

    // Convert numeric country code to ISO 3166-1 alpha-2
    if (account.country) {
      const numericCode = account.country.toString();
      countryAlpha2 = countries.numericToAlpha2(numericCode);
    }

    // Transform claims array to nested record format
    const claimsRecord = account.identity?.claims.reduce<
      Record<string, Record<string, string>>
    >((acc, claim) => {
      const valuesRecord = claim.values.reduce<Record<string, string>>(
        (valAcc, { key, value }) => {
          valAcc[key] = value;
          return valAcc;
        },
        {}
      );
      acc[claim.name] = valuesRecord;
      return acc;
    }, {});

    // Return the array of system contracts
    return {
      id: account.id,
      country: countryAlpha2,
      claims: claimsRecord,
    };
  });
