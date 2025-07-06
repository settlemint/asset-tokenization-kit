/**
 * Token Creation Template Method
 *
 * This module implements the Template Method pattern for token creation.
 * It provides a unified algorithm that handles the common 95% of token creation
 * logic while delegating the varying 5% (mutations, variables, validation)
 * to concrete strategy implementations.
 *
 * The template handles:
 * - Authentication and authorization
 * - Message parsing with type-specific defaults
 * - Initial loading events
 * - Transaction execution via Portal GraphQL
 * - Real-time event streaming and progress tracking
 * - Error handling and validation
 * - Final result yielding
 *
 * @pattern Template Method + Strategy Pattern
 */

import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import type {
  TokenCreateInput,
  TokenCreateOutput,
} from "@/orpc/helpers/token.create.schema";
import { createTokenMessagesSchema } from "@/orpc/helpers/token.create.schema";
import { tokenFactoryPermissionMiddleware } from "@/orpc/middlewares/auth/token-factory-permission.middleware";
import {
  portalMiddleware,
  type ValidatedPortalClient,
} from "@/orpc/middlewares/services/portal.middleware";
import {
  systemMiddleware,
  type TokenFactory,
} from "@/orpc/middlewares/system/system.middleware";
import { tokenFactoryMiddleware } from "@/orpc/middlewares/system/token-factory.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { withEventMeta } from "@orpc/server";

// Import strategies to ensure they're registered
import type { SessionUser } from "@/lib/auth";
import type { AssetFactoryTypeId } from "@/lib/zod/validators/asset-types";
import "@/orpc/helpers/strategies";
import { getTokenCreationStrategy } from "@/orpc/helpers/token-creation-strategy";

/**
 * Template method for token creation that handles the common algorithm
 * while using strategies for token-type-specific operations
 *
 * @param input - The validated token creation input (discriminated union)
 * @param context - The request context with auth, portal client, etc.
 * @yields {TokenCreateOutput} Progress events with status, message, and transaction hash
 * @returns {AsyncGenerator} Generator that yields events and completes with transaction hash
 *
 * @example
 * ```typescript
 * // For deposit token
 * for await (const event of createTokenTemplate({
 *   type: "deposit",
 *   name: "USD Deposit",
 *   symbol: "USDD",
 *   decimals: 2,
 *   verification: { code: "123456", type: "pincode" }
 * }, context)) {
 *   console.log(`${event.status}: ${event.message}`);
 * }
 * ```
 */
export async function* createTokenTemplate(
  input: TokenCreateInput,
  context: {
    user: SessionUser;
    portalClient: ValidatedPortalClient;
    tokenFactory: TokenFactory;
  }
): AsyncGenerator<TokenCreateOutput> {
  // Get the appropriate strategy for this token type
  // TODO: set the strategy based on token type somewhere
  const strategy = getTokenCreationStrategy(input.type);

  // Get the sender information
  const sender = context.user;

  // Parse messages with type-specific defaults using strategy
  const messages = createTokenMessagesSchema(input.type).parse(
    input.messages ?? {}
  );

  // Yield initial loading message
  yield withEventMeta(
    {
      status: "pending" as const,
      message: messages.initialLoading,
      tokenType: [input.type],
    },
    { id: "token-creation", retry: 1000 }
  );

  // Prepare challenge response for MFA
  const challengeResponse = await handleChallenge(sender, {
    code: input.verification.verificationCode,
    type: input.verification.verificationType,
  });

  // Build variables using strategy-specific logic
  const variables = strategy.getVariables(input, {
    user: context.user,
    tokenFactory: context.tokenFactory,
    challengeResponse,
  });

  // Get mutation from strategy
  const mutation = strategy.getMutation();

  // Execute transaction with real-time tracking
  let validatedHash = "";
  let hasConfirmedEvent = false;

  try {
    // Use the Portal client's mutate method that returns an async generator
    // This enables real-time transaction tracking for token creation
    for await (const event of context.portalClient.mutate(
      mutation,
      variables,
      messages.tokenCreationFailed,
      messages
    )) {
      // Store transaction hash from the first event
      validatedHash = event.transactionHash;

      // Handle different event statuses and yield appropriate progress updates
      if (event.status === "pending") {
        // Yield pending events to show transaction progress
        yield withEventMeta(
          {
            status: "pending" as const,
            message: messages.creatingToken,
            transactionHash: validatedHash,
            tokenType: [input.type],
          },
          { id: "token-creation", retry: 1000 }
        );
      } else if (event.status === "confirmed") {
        hasConfirmedEvent = true;
        yield withEventMeta(
          {
            status: "confirmed" as const,
            message: messages.tokenCreated,
            transactionHash: validatedHash,
            result: getEthereumHash(validatedHash),
            tokenType: [input.type],
          },
          { id: "token-creation", retry: 1000 }
        );
      } else {
        // event.status === "failed"
        yield withEventMeta(
          {
            status: "failed" as const,
            message: event.message || messages.tokenCreationFailed,
            transactionHash: validatedHash,
            tokenType: [input.type],
          },
          { id: "token-creation", retry: 1000 }
        );
      }
    }
  } catch (error) {
    // Handle any errors during mutation execution
    const errorMessage =
      error instanceof Error ? error.message : messages.defaultError;
    yield withEventMeta(
      {
        status: "failed" as const,
        message: errorMessage,
        transactionHash: validatedHash,
        tokenType: [input.type],
      },
      { id: "token-creation", retry: 1000 }
    );
    return;
  }

  // Ensure we always yield a result if no confirmed event was received
  if (!hasConfirmedEvent && validatedHash) {
    yield withEventMeta(
      {
        status: "confirmed" as const,
        message: messages.tokenCreated,
        transactionHash: validatedHash,
        result: getEthereumHash(validatedHash),
        tokenType: [input.type],
      },
      { id: "token-creation", retry: 1000 }
    );
  }

  // TODO: Add post-creation operations like ISIN claim, role granting, etc.
  // These could also be delegated to strategies if they vary by token type
}

/**
 * Helper function to create a token creation handler with the appropriate middleware
 * This reduces boilerplate when creating handlers for specific token types
 *
 * @param factoryType - The factory type for the token (e.g., "ATKDepositFactory")
 * @returns A configured handler function ready to be used in router definitions
 */
export function createTokenHandler(factoryType: AssetFactoryTypeId) {
  return onboardedRouter.token.create
    .use(portalMiddleware)
    .use(systemMiddleware)
    .use(tokenFactoryMiddleware(factoryType))
    .use(tokenFactoryPermissionMiddleware(["deployer"]))
    .handler(async function* ({ input, context }) {
      yield* createTokenTemplate(input, {
        user: context.auth.user,
        portalClient: context.portalClient,
        tokenFactory: context.tokenFactory,
      });
    });
}
