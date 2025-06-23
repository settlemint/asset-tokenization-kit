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
 *
 * @generator Yields progress events during system creation and bootstrapping
 * @see {@link ../system.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { withEventMeta } from "@orpc/server";
import { z } from "zod/v4";
import { SystemCreateMessagesSchema } from "./system.create.schema";

/**
 * GraphQL mutation for creating a new system contract instance.
 *
 * @param address - The factory contract address to call
 * @param from - The wallet address initiating the transaction
 * @param challengeResponse - The MFA challenge response for transaction authorization
 * @param verificationId - Optional verification ID for the challenge
 *
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const CREATE_SYSTEM_MUTATION = portalGraphql(`
  mutation CreateSystemMutation($address: String!, $from: String!) {
    ATKSystemFactoryCreateSystem(
      address: $address
      from: $from
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for bootstrapping a system contract.
 *
 * @param address - The system contract address to bootstrap
 * @param from - The wallet address initiating the transaction
 *
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const BOOTSTRAP_SYSTEM_MUTATION = portalGraphql(`
  mutation BootstrapSystemMutation($address: String!, $from: String!) {
    IATKSystemBootstrap(
      address: $address
      from: $from
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query to find system contracts deployed in a specific transaction.
 *
 * Used to retrieve the system contract address after deployment by matching
 * the deployment transaction hash. This ensures we get the correct contract
 * instance when multiple systems might be deployed.
 *
 * @param deployedInTransaction - The transaction hash where the system was deployed
 * @returns Array of system objects containing their IDs (contract addresses)
 */
const FIND_SYSTEM_FOR_TRANSACTION_QUERY = theGraphGraphql(`
  query findSystemForTransaction($deployedInTransaction: Bytes) {
    systems(where: {deployedInTransaction: $deployedInTransaction}) {
      id
    }
  }
`);

/**
 * Creates a new system contract instance using async iteration for real-time progress tracking.
 *
 * This handler uses a generator pattern to yield progress updates during the multi-step
 * system creation process, including contract deployment and bootstrapping.
 *
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client with transaction tracking
 * @middleware theGraphMiddleware - Provides TheGraph client for querying deployed contracts
 *
 * @param input.contract - The system factory contract address (defaults to standard address)
 * @param input.messages - Optional custom messages for localization
 *
 * @yields {TransactionEvent} Progress events during system creation and bootstrapping
 * @returns {AsyncGenerator} Generator that yields events and completes with the system contract address
 *
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If system creation or bootstrapping fails
 *
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
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract } = input;
    const sender = context.auth.user;

    // Parse messages with defaults using Zod schema
    const messages = SystemCreateMessagesSchema.parse(input.messages ?? {});

    // Execute the system creation transaction
    const createSystemVariables = {
      address: contract,
      from: sender.wallet,
      // ...(await handleChallenge(sender, verification)),
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

      // Only yield pending and failed events during creation phase
      // Confirmed events are handled after we query for the system address
      if (event.status === "pending" || event.status === "failed") {
        // Transform Portal event to ORPC event format with metadata
        yield withEventMeta(
          {
            status: event.status,
            message: event.message,
            result: undefined,
          },
          { id: transactionHash, retry: 1000 }
        );

        // If transaction failed, stop the entire process
        if (event.status === "failed") {
          return;
        }
      }
    }

    // Query for the deployed system contract
    const queryVariables = {
      deployedInTransaction: transactionHash,
    };

    // Define the schema for the query result
    const SystemQueryResultSchema = z.object({
      systems: z
        .array(
          z.object({
            id: z.string(),
          })
        )
        .min(1),
    });

    const result = await context.theGraphClient.query(
      FIND_SYSTEM_FOR_TRANSACTION_QUERY,
      queryVariables,
      SystemQueryResultSchema,
      messages.systemCreationFailed
    );

    const systems = result.systems;

    const system = systems[0];

    if (!system) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
        cause: new Error(
          `System object is null for transaction ${transactionHash}`
        ),
      });
    }

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
    const bootstrapVariables = {
      address: system.id,
      from: sender.wallet,
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
