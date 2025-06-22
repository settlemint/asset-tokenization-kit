import { theGraphClient } from "@/lib/settlemint/the-graph";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import type { TadaDocumentNode } from "gql.tada";
import type { Variables } from "graphql-request";
import type { z } from "zod/v4";
import { baseRouter } from "../../procedures/base.router";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

/**
 * Creates a validated TheGraph client with built-in error handling and validation
 */
function createValidatedTheGraphClient(
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]["errors"]
) {
  return {
    async query<TResult, TVariables extends Variables, TValidated>(
      document: TadaDocumentNode<TResult, TVariables>,
      variables: TVariables,
      schema: z.ZodType<TValidated>,
      userMessage: string
    ): Promise<TValidated> {
      const operation =
        (
          document as TadaDocumentNode<TResult, TVariables> & {
            __meta?: { operationName?: string };
          }
        ).__meta?.operationName ?? "GraphQL Query";

      let result: TResult;
      try {
        result = await (
          theGraphClient.request as <D, V extends Variables>(
            doc: TadaDocumentNode<D, V>,
            vars: V
          ) => Promise<D>
        )(document, variables);
      } catch (error) {
        logger.error(`GraphQL ${operation} failed`, {
          operation,
          ...variables,
          error: error instanceof Error ? error.message : String(error),
        });

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Check for specific error patterns
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("404") ||
          errorMessage.includes("No ")
        ) {
          throw errors.NOT_FOUND({
            message: userMessage,
            data: { operation, details: errorMessage },
          });
        }

        throw errors.INTERNAL_SERVER_ERROR({
          message: userMessage,
          cause: new Error(`GraphQL ${operation} failed: ${errorMessage}`),
        });
      }

      // Validate with Zod schema
      const parseResult = schema.safeParse(result);
      if (!parseResult.success) {
        logger.error(`Invalid response format from ${operation}`, {
          operation,
          result,
          error: parseResult.error,
        });

        throw errors.INTERNAL_SERVER_ERROR({
          message: userMessage,
          cause: new Error(
            `Invalid response format from ${operation}: ${parseResult.error.message}`
          ),
        });
      }

      return parseResult.data;
    },
  } as const;
}

/**
 * ORPC middleware that injects a validated TheGraph client into the procedure context.
 *
 * This middleware provides a TheGraph client with built-in validation for all GraphQL queries:
 * - All queries require and enforce Zod schema validation
 * - Operation names are automatically extracted from GraphQL documents
 * - Consistent error handling and logging
 *
 * @remarks
 * - Enforces validation at the middleware level - no bypassing allowed
 * - Essential for procedures that need to query historical blockchain data or events
 * - No mutations supported as TheGraph is read-only
 *
 * @example
 * ```typescript
 * const TransfersSchema = z.object({
 *   transfers: z.array(z.object({
 *     id: z.string(),
 *     from: z.string(),
 *     to: z.string(),
 *     value: z.string()
 *   }))
 * });
 *
 * const result = await context.theGraphClient.query(
 *   GET_TRANSFERS_QUERY,
 *   { tokenId: input.tokenId },
 *   TransfersSchema,
 *   messages.transfersNotFound
 * );
 * ```
 */
export const theGraphMiddleware = baseRouter.middleware((options) => {
  const { context, next, errors } = options;

  // If already has our methods, use existing client
  if (context.theGraphClient && "query" in context.theGraphClient) {
    return next({
      context: {
        theGraphClient: context.theGraphClient,
      },
    });
  }

  // Create validated client
  const theGraphClient = createValidatedTheGraphClient(errors);

  // Return with guaranteed theGraphClient
  return next({
    context: {
      theGraphClient,
    },
  });
});

// Export the inferred type of the validated client
export type ValidatedTheGraphClient = ReturnType<
  typeof createValidatedTheGraphClient
>;
