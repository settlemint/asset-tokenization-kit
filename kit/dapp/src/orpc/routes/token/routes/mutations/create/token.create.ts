import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenFactoryPermissionMiddleware } from "@/orpc/middlewares/auth/token-factory-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { tokenCreateHandlerMap } from "@/orpc/routes/token/routes/mutations/create/helpers/handler-map";
import type { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { z } from "zod";

/**
 * GraphQL query to find tokens deployed in a specific transaction.
 * Used to retrieve the token contract address after deployment.
 */
const FIND_TOKEN_FOR_TRANSACTION_QUERY = theGraphGraphql(`
  query findTokenForTransaction($deployedInTransaction: Bytes) {
    tokens(where: {deployedInTransaction: $deployedInTransaction}) {
      id
      name
      symbol
      decimals
      type
    }
  }
`);

export const create = onboardedRouter.token.create
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .use(systemMiddleware)
  .use(
    tokenFactoryPermissionMiddleware<typeof TokenCreateSchema>({
      requiredRoles: TOKEN_PERMISSIONS.create,
      getTokenType: (input) => input.type,
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { tokenFactory } = context;

    const handler = tokenCreateHandlerMap[input.type];
    const challengeResponse = await handleChallenge(context.auth.user, {
      code: input.verification.verificationCode,
      type: input.verification.verificationType,
    });

    // The handler will return the transaction hash
    const transactionHash = await handler(input, {
      mutationVariables: {
        address: tokenFactory.address,
        from: context.auth.user.wallet,
        ...challengeResponse,
      },
      portalClient: context.portalClient,
    });

    // Query for the deployed token contract
    const queryVariables: VariablesOf<typeof FIND_TOKEN_FOR_TRANSACTION_QUERY> =
      {
        deployedInTransaction: transactionHash,
      };

    // Define the schema for the query result
    const TokenQueryResultSchema = z.object({
      tokens: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          symbol: z.string(),
          decimals: z.number(),
          type: z.string(),
        })
      ),
    });

    const result = await context.theGraphClient.query(
      FIND_TOKEN_FOR_TRANSACTION_QUERY,
      {
        input: queryVariables,
        output: TokenQueryResultSchema,
        error: "Failed to find created token",
      }
    );

    if (result.tokens.length === 0) {
      throw errors.NOT_FOUND({
        message: "Token not found after creation",
        cause: new Error(`Token not found for transaction ${transactionHash}`),
      });
    }

    const token = result.tokens[0];

    if (!token) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create token",
        cause: new Error(
          `Token object is null for transaction ${transactionHash}`
        ),
      });
    }

    // Return the complete token details using the read handler
    return await call(
      read,
      {
        tokenAddress: token.id,
      },
      { context }
    );
  });
