/**
 * Current User Handler
 *
 * This handler returns information about the currently authenticated user.
 * It provides a simple way for clients to fetch the logged-in user's profile
 * data without needing to manage session state directly.
 *
 * @see {@link ../user.me.schema} - Output schema definition
 * @see {@link @/orpc/procedures/auth.router} - Authentication requirements
 */

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { ar } from "@/orpc/procedures/auth.router";
import * as countries from "i18n-iso-countries";

const ACCOUNT_QUERY = theGraphGraphql(`
  query AccountQuery($id: ID!) {
    account(id: $id) {
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
 * Get current authenticated user information.
 *
 * Returns the user object from the authentication context, which includes
 * essential profile information such as name, email, and wallet address.
 * This endpoint is commonly used for:
 * - Displaying user information in the UI
 * - Determining user permissions and capabilities
 * - Personalizing the application experience
 *
 * @auth Required - User must be authenticated
 * @method GET /user/me
 *
 * @param context - Request context containing authenticated user information
 * @returns User object with profile data and wallet address
 *
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 *
 * @example
 * ```typescript
 * // Client usage:
 * const user = await orpc.user.me.query();
 * console.log(`Welcome ${user.name}!`);
 *
 * // Display wallet address
 * console.log(`Wallet: ${user.wallet}`);
 *
 * // Use in React component
 * const { data: user, isLoading } = orpc.user.me.useQuery();
 * ```
 */
export const me = ar.user.me
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    const user = context.auth.user;
    const { account } = await context.theGraphClient.request(ACCOUNT_QUERY, {
      id: user.wallet,
    });

    // Convert numeric country code to ISO 3166-1 alpha-2
    let countryAlpha2: string | undefined;
    if (account?.country) {
      const numericCode = account.country.toString();
      countryAlpha2 = countries.numericToAlpha2(numericCode);
    }

    // Transform claims array to nested record format
    const claimsRecord = account?.identity?.claims.reduce<
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

    return {
      name: user.name,
      email: user.email,
      wallet: ethereumAddress.parse(user.wallet),
      country: countryAlpha2,
      claims: claimsRecord,
    };
  });
