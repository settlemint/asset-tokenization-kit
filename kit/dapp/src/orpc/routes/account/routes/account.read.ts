import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import {
  AccountResponseSchema,
  type AccountReadSchema,
} from "@/orpc/routes/account/routes/account.read.schema";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import countries from "i18n-iso-countries";

const READ_ACCOUNT_QUERY = theGraphGraphql(`
  query ReadAccountQuery($walletAddress: ID!) {
    account(id: $walletAddress) {
      id
      country
      identity {
        id
        claims {
          id
          name
          revoked
          issuer {
            id
          }
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
 * Account read route handler.
 *
 * Retrieves the account information for the given wallet address.
 * Is used during onboarding so cannot use the onboarded router
 *
 */
export const read = authRouter.account.read
  .use(systemMiddleware)
  .use(
    blockchainPermissionsMiddleware<typeof AccountReadSchema>({
      requiredRoles: SYSTEM_PERMISSIONS.accountRead,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
      alwaysAllowIf: ({ auth }, { wallet }) => {
        return wallet === auth?.user.wallet;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { wallet } = input;

    // Execute TheGraph query with type-safe parameters
    // The Zod schema ensures type safety at both compile-time and runtime
    const result = await context.theGraphClient.query(READ_ACCOUNT_QUERY, {
      input: { walletAddress: wallet },
      output: AccountResponseSchema,
    });

    if (!result.account) {
      throw errors.NOT_FOUND({
        message: "Account not found",
      });
    }

    // Return the account with basic information only
    // TypeScript ensures the return type matches AccountReadOutput interface
    return {
      id: result.account.id,
      country: result.account.country
        ? countries.numericToAlpha2(result.account.country)
        : undefined,
      identity: result.account.identity?.id,
      claims:
        result.account.identity?.claims.map((claim) => ({
          id: claim.id,
          name: claim.name,
          revoked: claim.revoked,
          issuer: claim.issuer,
          values: claim.values,
        })) ?? [],
    };
  });
