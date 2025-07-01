/**
 * Deposit Token Creation Handler
 *
 * This handler creates deposit tokens through the ATKDepositFactoryImplementation
 * using an async generator pattern for real-time transaction tracking.
 * It supports creating deposit tokens with configurable properties like name,
 * symbol, and decimal precision.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Executes transaction via Portal GraphQL with real-time tracking
 * 3. Yields progress events during deposit creation
 * 4. Returns the transaction hash of the successful deposit creation
 * @generator
 * @see {@link ./deposit.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { tokenFactoryMiddleware } from "@/orpc/middlewares/system/token-factory.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { withEventMeta } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { DepositCreateMessagesSchema } from "./deposit.create.schema";

/**
 * GraphQL mutation for creating a deposit token.
 * @param address - The deposit factory contract address to call
 * @param from - The wallet address initiating the transaction
 * @param symbol_ - The symbol of the deposit token
 * @param name_ - The name of the deposit token
 * @param decimals_ - The number of decimal places for the token
 * @param initialModulePairs_ - Initial module pairs for the deposit
 * @param requiredClaimTopics_ - Required claim topics for compliance
 * @param verificationId - Optional verification ID for the challenge
 * @param challengeResponse - The MFA challenge response for transaction authorization
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const CREATE_DEPOSIT_MUTATION = portalGraphql(`
  mutation CreateDepositMutation($address: String!, $from: String!, $symbol_: String!, $name_: String!, $decimals_: Int!, $initialModulePairs_: [ATKDepositFactoryImplementationATKDepositFactoryImplementationCreateDepositInitialModulePairsInput!]!, $requiredClaimTopics_: [String!]!, $verificationId: String, $challengeResponse: String!) {
    CreateDeposit: ATKDepositFactoryImplementationCreateDeposit(
      address: $address
      from: $from
      input: {
        symbol_: $symbol_
        name_: $name_
        decimals_: $decimals_
        initialModulePairs_: $initialModulePairs_
        requiredClaimTopics_: $requiredClaimTopics_
      }
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Creates deposit tokens using async iteration for progress tracking.
 *
 * This handler uses a generator pattern to yield real-time progress updates during
 * deposit token creation, providing detailed status for each step of the process.
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client with transaction tracking
 * @middleware systemMiddleware - Provides system context
 * @middleware tokenFactoryMiddleware - Provides deposit factory context
 * @param input.name - The name of the deposit token
 * @param input.symbol - The symbol of the deposit token
 * @param input.decimals - The number of decimal places for the token
 * @param input.messages - Optional custom messages for localization
 * @yields {DepositCreationEvent} Progress events with status, message, and transaction hash
 * @returns {AsyncGenerator} Generator that yields events and completes with transaction hash
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If deposit creation fails
 * @example
 * ```typescript
 * // Create a deposit token with progress tracking
 * for await (const event of client.tokens.depositCreate({
 *   name: "Corporate Deposit",
 *   symbol: "CDEP",
 *   decimals: 18
 * })) {
 *   console.log(`${event.status}: ${event.message}`);
 *   if (event.status === "confirmed" && event.result) {
 *     console.log(`Deposit created with hash: ${event.result}`);
 *   }
 * }
 * ```
 */
export const depositCreate = onboardedRouter.token.depositCreate
  .use(portalMiddleware)
  .use(systemMiddleware)
  .use(tokenFactoryMiddleware("deposit"))
  // .use(tokenFactoryPermissionMiddleware(["deployer"]))
  .handler(async function* ({ input, context }) {
    const sender = context.auth.user;

    // Parse messages with defaults
    const messages = DepositCreateMessagesSchema.parse(input.messages ?? {});

    // Yield initial loading message
    yield withEventMeta(
      {
        status: "pending",
        message: messages.initialLoading,
      },
      { id: "deposit-creation", retry: 1000 }
    );

    // Execute the deposit creation transaction
    const variables: VariablesOf<typeof CREATE_DEPOSIT_MUTATION> = {
      address: context.tokenFactory.address,
      from: sender.wallet,
      symbol_: input.symbol,
      name_: input.name,
      decimals_: input.decimals,
      initialModulePairs_: [],
      requiredClaimTopics_: [],
      ...(await handleChallenge(sender, {
        code: input.verification.verificationCode,
        type: input.verification.verificationType,
      })),
    };

    let validatedHash = "";
    let hasConfirmedEvent = false;

    // Use the Portal client's mutate method that returns an async generator
    // This enables real-time transaction tracking for deposit creation
    for await (const event of context.portalClient.mutate(
      CREATE_DEPOSIT_MUTATION,
      variables,
      messages.depositCreationFailed,
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
            message: messages.creatingDeposit,
            transactionHash: validatedHash,
          },
          { id: "deposit-creation", retry: 1000 }
        );
      } else if (event.status === "confirmed") {
        hasConfirmedEvent = true;
        yield withEventMeta(
          {
            status: "confirmed" as const,
            message: messages.depositCreated,
            transactionHash: validatedHash,
            result: getEthereumHash(validatedHash),
          },
          { id: "deposit-creation", retry: 1000 }
        );
      } else {
        // event.status === "failed"
        yield withEventMeta(
          {
            status: "failed" as const,
            message: event.message || messages.depositCreationFailed,
            transactionHash: validatedHash,
          },
          { id: "deposit-creation", retry: 1000 }
        );
      }
    }

    // Ensure we always yield a final result if no confirmed event was received
    if (!hasConfirmedEvent && validatedHash) {
      yield withEventMeta(
        {
          status: "confirmed" as const,
          message: messages.depositCreated,
          transactionHash: validatedHash,
          result: getEthereumHash(validatedHash),
        },
        { id: "deposit-creation", retry: 1000 }
      );
    }

    // TODO: other operations to create a deposit (issue isin claim, grant roles, etc)
  });
