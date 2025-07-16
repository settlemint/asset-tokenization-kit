/**
 * System Creation Handler
 *
 * This handler creates a new system contract instance through the ATKSystemFactory
 * using an async generator pattern for real-time transaction tracking and progress updates.
 * System contracts are fundamental infrastructure components in the SettleMint
 * platform that manage various system-level operations and configurations.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Creates the system contract via Portal GraphQL with transaction tracking
 * 3. Queries TheGraph to get the deployed system contract address
 * 4. Bootstraps the system contract to initialize its state
 * 5. Yields progress events throughout the process
 * @generator
 * @see {@link ../system.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { permissionsMiddleware } from "@/orpc/middlewares/auth/permissions.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { read } from "@/orpc/routes/settings/routes/settings.read";
import { upsert } from "@/orpc/routes/settings/routes/settings.upsert";
import { call, withEventMeta } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { z } from "zod";
import { SystemCreateMessagesSchema } from "./system.create.schema";

const logger = createLogger();

/**
 * GraphQL mutation for creating a new system contract instance.
 * @param address - The factory contract address to call
 * @param from - The wallet address initiating the transaction
 * @param challengeResponse - The MFA challenge response for transaction authorization
 * @param verificationId - Optional verification ID for the challenge
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const CREATE_SYSTEM_MUTATION = portalGraphql(`
  mutation CreateSystemMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $from: String!
  ) {
    ATKSystemFactoryCreateSystem(
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for bootstrapping a system contract.
 * @param address - The system contract address to bootstrap
 * @param from - The wallet address initiating the transaction
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const BOOTSTRAP_SYSTEM_MUTATION = portalGraphql(`
  mutation BootstrapSystemMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $from: String!
  ) {
    IATKSystemBootstrap(
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
    ) {
      transactionHash
    }
  }
`);

/**
 * Creates a new system contract instance using async iteration for real-time progress tracking.
 *
 * This handler uses a generator pattern to yield progress updates during the multi-step
 * system creation process, including contract deployment and bootstrapping.
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client with transaction tracking
 * @middleware theGraphMiddleware - Provides TheGraph client for querying deployed contracts
 * @param input.contract - The system factory contract address (defaults to standard address)
 * @param input.messages - Optional custom messages for localization
 * @param input.verification - The verification code and type for the transaction
 * @yields {TransactionEvent} Progress events during system creation and bootstrapping
 * @returns {AsyncGenerator} Generator that yields events and completes with the system contract address
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If system creation or bootstrapping fails
 * @example
 * ```typescript
 * // Create system with async iteration for progress tracking
 * for await (const event of client.system.create({
 *   contract: "0x123..."
 * })) {
 *   console.log(`Status: ${event.status}, Message: ${event.message}`);
 *
 *   if (event.status === "confirmed" && event.result) {
 *     console.log(`System created at: ${event.result}`);
 *   }
 * }
 *
 * // Or use with React hooks
 * const { mutate } = client.system.create.useMutation({
 *   onProgress: (event) => {
 *     // Update UI with progress
 *   }
 * });
 * ```
 */
export const create = onboardedRouter.system.create
  .use(permissionsMiddleware({ system: ["create"] }))
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification } = input;
    const sender = context.auth.user;

    // Parse messages with defaults using Zod schema
    const messages = SystemCreateMessagesSchema.parse(input.messages ?? {});

    // Check if system already exists using orpc
    const existingSystem = await call(
      read,
      {
        key: "SYSTEM_ADDRESS",
      },
      {
        context,
      }
    );

    if (existingSystem) {
      throw errors.RESOURCE_ALREADY_EXISTS({
        message:
          "System already exists. Only one system is allowed per platform.",
        cause: new Error(
          `System already deployed at address: ${existingSystem}`
        ),
      });
    }

    // Execute the system creation transaction
    const createSystemVariables: VariablesOf<typeof CREATE_SYSTEM_MUTATION> = {
      address: contract,
      from: sender.wallet,
      ...(await handleChallenge(sender, {
        code: verification.verificationCode,
        type: verification.verificationType,
      })),
    };

    // Use the Portal client's mutate method that returns an async generator
    // This enables real-time transaction tracking with automatic status updates
    let transactionHash = "";

    // Iterate through transaction events as they occur
    for await (const event of context.portalClient.mutate(
      CREATE_SYSTEM_MUTATION,
      createSystemVariables,
      messages.systemCreationFailed,
      messages
    )) {
      // Store the transaction hash from the first event
      transactionHash = event.transactionHash;

      // Yield all events except confirmed (we'll handle that after getting the system address)
      if (event.status === "pending") {
        yield withEventMeta(
          {
            status: event.status,
            message: event.message,
            result: undefined,
          },
          { id: transactionHash, retry: 1000 }
        );
      } else if (event.status === "failed") {
        // Transform Portal event to ORPC event format with metadata
        yield withEventMeta(
          {
            status: event.status,
            message: event.message,
            result: undefined,
          },
          { id: transactionHash, retry: 1000 }
        );
        return;
      } else {
        // Transaction is confirmed, now we need to get the system address
        // Since we can't rely on TheGraph indexing, we'll extract it from the transaction receipt
        break;
      }
    }

    // Get the system address from the transaction receipt using Portal
    // This avoids the need for TheGraph indexing during initial system deployment
    const getTransactionReceiptQuery = portalGraphql(`
      query GetTransactionReceipt($transactionHash: String!) {
        getTransaction(transactionHash: $transactionHash) {
          receipt {
            logs
            contractAddress
            status
          }
        }
      }
    `);

    let receiptResult;
    try {
      receiptResult = await context.portalClient.query(
        getTransactionReceiptQuery,
        { transactionHash },
        z.object({
          getTransaction: z.object({
            receipt: z.object({
              logs: z.any(), // logs is JSON type in Portal
              contractAddress: z.string().nullable(),
              status: z.string(),
            }),
          }),
        }),
        messages.systemCreationFailed
      );
    } catch (error) {
      // Log the actual error for debugging
      logger.error("Portal query failed:", error);
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
        cause: new Error(
          `Portal query failed: ${error instanceof Error ? error.message : String(error)}`
        ),
      });
    }

    const receipt = receiptResult.getTransaction.receipt;

    // Check if transaction was successful
    if (receipt.status !== "Success") {
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
        cause: new Error(`Transaction failed with status: ${receipt.status}`),
      });
    }

    // For system creation, we need to parse the logs to find the system address
    // The logs should contain a SystemCreated event with the system address
    let systemAddress: string | null = null;

    try {
      logger.debug("Receipt logs:", receipt.logs);
      logger.debug("Receipt contractAddress:", receipt.contractAddress);
      logger.debug("Receipt status:", receipt.status);

      const logs = Array.isArray(receipt.logs) ? receipt.logs : [];

      // Look for the last log entry which should contain the system creation event
      // In ATK system factory, the last log usually contains the created system address
      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        logger.debug("Last log:", lastLog);
        if (lastLog && typeof lastLog === "object" && "address" in lastLog) {
          systemAddress = lastLog.address as string;
        }
      }

      // Fallback: use contractAddress if no logs found
      if (!systemAddress && receipt.contractAddress) {
        systemAddress = receipt.contractAddress;
      }

      logger.debug("Extracted system address:", systemAddress);
    } catch (error) {
      logger.error("Error parsing transaction logs:", error);
      // If log parsing fails, continue with null systemAddress to trigger error below
    }

    if (!systemAddress) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
        cause: new Error(
          `Could not extract system address from transaction ${transactionHash}. Receipt: ${JSON.stringify(receipt, null, 2)}`
        ),
      });
    }

    const system = { id: systemAddress };

    // For newly created systems, bootstrap is required
    // We'll attempt to bootstrap and handle any errors gracefully

    // Now bootstrap the system
    yield withEventMeta(
      {
        status: "pending",
        message: messages.bootstrappingSystem,
        result: undefined,
      },
      { id: `${transactionHash}-bootstrap`, retry: 1000 }
    );

    // Execute the bootstrap transaction
    const bootstrapVariables: VariablesOf<typeof BOOTSTRAP_SYSTEM_MUTATION> = {
      address: system.id,
      from: sender.wallet,
      ...(await handleChallenge(sender, {
        code: verification.verificationCode,
        type: verification.verificationType,
      })),
    };

    // Track bootstrap transaction using the same async generator pattern
    let bootstrapSucceeded = false;
    let bootstrapTransactionHash = "";

    // Iterate through bootstrap transaction events
    for await (const event of context.portalClient.mutate(
      BOOTSTRAP_SYSTEM_MUTATION,
      bootstrapVariables,
      messages.bootstrapFailed,
      {
        ...messages,
        waitingForMining: messages.bootstrappingSystem,
      }
    )) {
      // Store the bootstrap transaction hash
      bootstrapTransactionHash = event.transactionHash;

      // Yield all bootstrap events with a unique ID to distinguish from creation events
      yield withEventMeta(
        {
          status: event.status,
          message: event.message,
          result: undefined,
        },
        { id: `${bootstrapTransactionHash}-bootstrap`, retry: 1000 }
      );

      // Track final bootstrap status for the completion event
      if (event.status === "confirmed") {
        bootstrapSucceeded = true;
      } else if (event.status === "failed") {
        bootstrapSucceeded = false;
        // Don't return early - we still need to report the system ID
        // even if bootstrap failed, as the system was created successfully
        break;
      }
    }

    // Save the system address to settings using orpc BEFORE yielding final events
    await call(
      upsert,
      {
        key: "SYSTEM_ADDRESS",
        value: system.id,
      },
      {
        context,
      }
    );

    // Save bootstrap completion status
    await call(
      upsert,
      {
        key: "SYSTEM_BOOTSTRAP_COMPLETE",
        value: bootstrapSucceeded ? "true" : "false",
      },
      {
        context,
      }
    );

    // Always yield the final event with the system ID
    // If bootstrap failed, we still return the system ID but with failed status
    if (!bootstrapSucceeded) {
      yield withEventMeta(
        {
          status: "failed",
          message: `${messages.systemCreatedBootstrapFailed} System address: ${system.id}`,
          result: system.id,
        },
        { id: transactionHash, retry: 1000 }
      );
    } else {
      yield withEventMeta(
        {
          status: "confirmed",
          message: messages.systemCreated,
          result: system.id,
        },
        { id: transactionHash, retry: 1000 }
      );
    }

    return;
  });
