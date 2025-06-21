/**
 * Token Factory Creation Handler
 *
 * This handler creates token factory contracts through the ATKSystemImplementation.
 * It supports creating factories for different asset types (bond, equity, fund,
 * stablecoin, deposit) either individually or in batch.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Processes factory creation requests (single or batch)
 * 3. Executes transactions via Portal GraphQL
 * 4. Tracks transaction status and returns factory addresses
 *
 * @see {@link ./factory.create.schema} - Input validation schema
 * @see {@link @/orpc/helpers/transactions} - Transaction tracking
 */

import type { portalClient as PortalClientType } from "@/lib/settlemint/portal";
import { portalGraphql } from "@/lib/settlemint/portal";
import type { theGraphClient as TheGraphClientType } from "@/lib/settlemint/the-graph";
import { ethereumHash } from "@/lib/zod/validators/ethereum-hash";
import { trackTransaction } from "@/orpc/helpers/transactions";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { withEventMeta } from "@orpc/server";
import {
  type FactoryCreateMessages,
  FactoryCreateMessagesSchema,
  type FactoryCreateOutput,
  type SingleFactory,
  getDefaultImplementations,
} from "./factory.create.schema";

/**
 * GraphQL mutation for creating a token factory.
 *
 * @param address - The system contract address to call
 * @param from - The wallet address initiating the transaction
 * @param _factoryImplementation - The factory implementation address
 * @param _tokenImplementation - The token implementation address
 * @param _name - The name for the token factory
 *
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const CREATE_TOKEN_FACTORY_MUTATION = portalGraphql(`
  mutation CreateTokenFactory(
    $address: String!
    $from: String!
    $factoryImplementation: String!
    $tokenImplementation: String!
    $name: String!
  ) {
    IATKTokenFactoryRegistryRegisterTokenFactory(
      address: $address
      from: $from
      input: {
        factoryImplementation: $factoryImplementation
        name: $name
        tokenImplementation: $tokenImplementation
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * Process a single factory creation
 */
async function* processSingleFactory(
  factory: SingleFactory,
  context: {
    portalClient: typeof PortalClientType;
    theGraphClient: typeof TheGraphClientType;
    systemContract: string;
    senderWallet: string;
  },
  messages: FactoryCreateMessages,
  progress?: { current: number; total: number }
): AsyncGenerator<FactoryCreateOutput> {
  const { type, name } = factory;
  const defaults = getDefaultImplementations(type);

  const factoryImplementation =
    factory.factoryImplementation ?? defaults.factoryImplementation;
  const tokenImplementation =
    factory.tokenImplementation ?? defaults.tokenImplementation;

  // Yield starting message
  const progressMessage = progress
    ? messages.batchProgress
        .replace("{{current}}", String(progress.current))
        .replace("{{total}}", String(progress.total))
    : messages.creatingFactory;

  yield {
    status: "pending",
    message: progressMessage,
    currentFactory: { type, name },
    progress,
  };

  try {
    // Execute the factory creation transaction
    const txHashResult = await context.portalClient.request(
      CREATE_TOKEN_FACTORY_MUTATION,
      {
        address: context.systemContract,
        from: context.senderWallet,
        factoryImplementation: factoryImplementation,
        tokenImplementation: tokenImplementation,
        name: name,
      }
    );

    const transactionHash =
      txHashResult.IATKTokenFactoryRegistryRegisterTokenFactory
        ?.transactionHash;

    if (!transactionHash) {
      yield {
        status: "failed",
        message: messages.factoryCreationFailed,
        currentFactory: {
          type,
          name,
          error: messages.factoryCreationFailed,
        },
        progress,
      };
      return;
    }

    // Validate transaction hash
    const validatedHash = ethereumHash.parse(transactionHash);

    // Track transaction
    for await (const event of trackTransaction(
      validatedHash,
      context.portalClient,
      context.theGraphClient,
      messages
    )) {
      if (event.status === "confirmed") {
        // Transaction confirmed - factory will be available asynchronously elsewhere
        yield {
          status: "confirmed",
          message: messages.factoryCreated,
          currentFactory: {
            type,
            name,
            transactionHash: validatedHash,
          },
          progress,
        };
        return;
      } else if (event.status === "failed") {
        // Check for SystemNotBootstrapped in the transaction error
        let failureMessage = event.message;
        if (event.message.includes("SystemNotBootstrapped")) {
          failureMessage = messages.systemNotBootstrapped;
        }

        yield {
          status: "failed",
          message: failureMessage,
          currentFactory: {
            type,
            name,
            transactionHash: validatedHash,
            error: event.message,
          },
          progress,
        };
        return;
      } else {
        // Pass through pending status
        yield {
          status: "pending",
          message: event.message,
          currentFactory: {
            type,
            name,
            transactionHash: validatedHash,
          },
          progress,
        };
      }
    }
  } catch (error) {
    // Check for specific error types
    let errorMessage = messages.defaultError;
    let errorDetail = messages.defaultError;

    if (error instanceof Error) {
      errorDetail = error.message;
      // Check for SystemNotBootstrapped error
      if (error.message.includes("SystemNotBootstrapped")) {
        errorMessage = messages.systemNotBootstrapped;
      }
    }

    yield {
      status: "failed",
      message: errorMessage,
      currentFactory: {
        type,
        name,
        error: errorDetail,
      },
      progress,
    };
  }
}

/**
 * Creates token factory contracts.
 *
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client
 *
 * @param input.contract - The system contract address (defaults to standard address)
 * @param input.factories - Single factory or array of factories to create
 * @param input.messages - Optional custom messages for localization
 *
 * @returns Stream of creation progress events
 *
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If Portal GraphQL request fails
 *
 * @example
 * ```typescript
 * // Create a single factory
 * for await (const event of client.tokens.factory.create({
 *   factories: {
 *     type: "bond",
 *     name: "Bond Token Factory"
 *   }
 * })) {
 *   console.log(event.status, event.message);
 * }
 *
 * // Create multiple factories
 * for await (const event of client.tokens.factory.create({
 *   factories: [
 *     { type: "bond", name: "Bond Factory" },
 *     { type: "equity", name: "Equity Factory" }
 *   ]
 * })) {
 *   console.log(event.progress?.current, "of", event.progress?.total);
 * }
 * ```
 */
export const factoryCreate = onboardedRouter.tokens.factoryCreate
  .use(portalMiddleware)
  .use(theGraphMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, factories } = input;
    const sender = context.auth.user;

    // Parse messages with defaults
    const messages = FactoryCreateMessagesSchema.parse(input.messages ?? {});

    // Normalize to array
    const factoryList = Array.isArray(factories) ? factories : [factories];
    const totalFactories = factoryList.length;

    // Yield initial loading message
    yield withEventMeta(
      {
        status: "pending",
        message: messages.initialLoading,
        progress: { current: 0, total: totalFactories },
      },
      { id: "factory-creation", retry: 1000 }
    );

    const results: FactoryCreateOutput["results"] = [];
    const processContext = {
      portalClient: context.portalClient,
      theGraphClient: context.theGraphClient,
      systemContract: contract,
      senderWallet: sender.wallet,
    };

    // Process each factory
    for (const [index, factory] of factoryList.entries()) {
      const progress = { current: index + 1, total: totalFactories };

      // Process single factory and collect results
      for await (const event of processSingleFactory(
        factory,
        processContext,
        messages,
        progress
      )) {
        // Update event metadata for proper streaming
        yield withEventMeta(event, {
          id: `factory-${factory.type}-${index}`,
          retry: 1000,
        });

        // Collect results for final summary
        if (
          event.currentFactory &&
          (event.status === "confirmed" || event.status === "failed")
        ) {
          results.push({
            type: event.currentFactory.type,
            name: event.currentFactory.name,
            transactionHash: event.currentFactory.transactionHash,
            error: event.currentFactory.error,
          });
        }
      }
    }

    // Yield final completion event
    const successCount = results.filter((r) => !r.error).length;
    const completionMessage = messages.batchCompleted.replace(
      "{{count}}",
      String(successCount)
    );

    yield withEventMeta(
      {
        status: "completed",
        message: completionMessage,
        results,
        result: results, // Add result field for useStreamingMutation hook
        progress: { current: totalFactories, total: totalFactories },
      },
      { id: "factory-creation-complete", retry: 1000 }
    );
  });
