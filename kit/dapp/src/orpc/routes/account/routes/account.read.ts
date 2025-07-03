import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { permissionsMiddleware } from "@/orpc/middlewares/auth/permissions.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { AccountResponseSchema } from "@/orpc/routes/account/routes/account.read.schema";

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
  }
}
`);

/**
 * Account read route handler.
 *
 * Retrieves the account information for the given wallet address.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission - available to admin, issuer, user, and auditor roles
 * Method: GET /systems
 */
export const read = onboardedRouter.account.read
  .use(
    permissionsMiddleware({
      user: ["list"],
    })
  )
  .use(theGraphMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { wallet } = input;

    // Execute TheGraph query with type-safe parameters
    // The Zod schema ensures type safety at both compile-time and runtime
    const result = await context.theGraphClient.query(READ_ACCOUNT_QUERY, {
      input: {
        input: { walletAddress: wallet },
      },
      output: AccountResponseSchema,
      error: "Failed to retrieve account",
    });

    if (!result.account) {
      throw errors.NOT_FOUND({
        message: "Account not found",
      });
    }

    // Return the account with basic information only
    // Country and claims data not available in current subgraph schema
    // TypeScript ensures the return type matches AccountReadOutput interface
    return {
      id: result.account.id,
      country: undefined,
      claims: undefined,
    };
  });
