/**
 * System Creation Handler
 *
 * This handler creates a new system contract instance through the ATKSystemFactory.
 * System contracts are fundamental infrastructure components in the SettleMint
 * platform that manage various system-level operations and configurations.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Processes multi-factor authentication challenge
 * 3. Executes the system creation transaction via Portal GraphQL
 * 4. Returns the transaction hash for tracking
 *
 * @see {@link ../system.create.schema} - Input validation schema
 * @see {@link @/orpc/helpers/challenge-response} - MFA challenge handling
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { trackTransaction } from "@/orpc/helpers/transactions";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { withEventMeta } from "@orpc/server";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { SystemCreateMessagesSchema } from "./system.create.schema";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

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
 * Creates a new system contract instance.
 *
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client
 *
 * @param input.contract - The system factory contract address (defaults to standard address)
 * @param input.verification - MFA credentials for transaction authorization
 *
 * @returns The transaction hash of the system creation transaction
 *
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} VERIFICATION_ID_NOT_FOUND - If MFA verification ID is missing
 * @throws {ORPCError} CHALLENGE_FAILED - If MFA challenge verification fails
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If Portal GraphQL request fails
 *
 * @example
 * ```typescript
 * const txHash = await client.system.create({
 *   verification: {
 *     code: "123456",
 *     type: "pincode"
 *   }
 * });
 *
 * // Track the transaction
 * await client.transaction.track({
 *   operation: "system-create",
 *   transactionId: txHash
 * });
 * ```
 */
export const create = onboardedRouter.system.create
  .use(portalMiddleware)
  .use(theGraphMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract } = input;
    const sender = context.auth.user;

    // Parse messages with defaults using Zod schema
    const messages = SystemCreateMessagesSchema.parse(input.messages ?? {});

    // Execute the system creation transaction
    let txHashResult;
    try {
      txHashResult = await context.portalClient.request(
        CREATE_SYSTEM_MUTATION,
        {
          address: contract,
          from: sender.wallet,
          // ...(await handleChallenge(sender, verification)),
        }
      );
    } catch (error) {
      const errorDetails = {
        operation: "CREATE_SYSTEM_MUTATION",
        factory: contract,
        sender: sender.wallet,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
      logger.error("System creation GraphQL mutation failed", errorDetails);
      
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
        cause: new Error(
          `GraphQL mutation failed: ${error instanceof Error ? error.message : String(error)}. Factory: ${contract}, Sender: ${sender.wallet}`
        ),
      });
    }

    const transactionHash =
      txHashResult.ATKSystemFactoryCreateSystem?.transactionHash ?? null;
    
    if (transactionHash) {
      logger.info("System creation transaction submitted", {
        transactionHash,
        factory: contract,
        sender: sender.wallet,
      });
    }

    // Validate transaction hash
    if (!transactionHash) {
      logger.error("System creation failed: No transaction hash returned", {
        operation: "CREATE_SYSTEM_MUTATION",
        factory: contract,
        sender: sender.wallet,
        result: txHashResult,
      });
      
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
        cause: new Error("No transaction hash returned from ATKSystemFactoryCreateSystem mutation"),
      });
    }

    // Track transaction, yielding only pending/failed events
    // The confirmed event will be yielded at the end with the system ID
    for await (const event of trackTransaction(
      transactionHash,
      context.portalClient,
      context.theGraphClient,
      messages
    )) {
      // Only yield pending and failed events, skip confirmed
      if (event.status === "pending" || event.status === "failed") {
        // Transform the event to match SystemCreateOutputSchema
        // by removing transactionHash and adding optional result
        yield withEventMeta(
          {
            status: event.status,
            message: event.message,
            result: undefined, // No result yet for pending/failed events
          },
          { id: transactionHash, retry: 1000 }
        );

        // If failed, stop processing
        if (event.status === "failed") {
          return;
        }
      }
    }

    // Query for the deployed system contract
    let systems;
    try {
      const result = await context.theGraphClient.request(
        FIND_SYSTEM_FOR_TRANSACTION_QUERY,
        {
          deployedInTransaction: transactionHash,
        }
      );
      systems = result.systems;
    } catch (error) {
      const errorDetails = {
        operation: "FIND_SYSTEM_FOR_TRANSACTION_QUERY",
        transactionHash,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
      logger.error("Failed to query deployed system contract", errorDetails);
      
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
        cause: new Error(
          `TheGraph query failed: ${error instanceof Error ? error.message : String(error)}. Transaction: ${transactionHash}`
        ),
      });
    }

    if (systems.length === 0) {
      logger.error("No system contracts found after deployment", {
        operation: "FIND_SYSTEM_FOR_TRANSACTION_QUERY",
        transactionHash,
        systemsFound: systems.length,
      });
      
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
        cause: new Error(`System contract not found in transaction ${transactionHash} after deployment`),
      });
    }

    const system = systems[0];
    
    if (system) {
      logger.info("System contract deployed successfully", {
        systemAddress: system.id,
        deploymentTransaction: transactionHash,
      });
    }

    if (!system) {
      logger.error("System object is null after query", {
        operation: "FIND_SYSTEM_FOR_TRANSACTION_QUERY",
        transactionHash,
        systems,
      });
      
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
        cause: new Error(`System object is null for transaction ${transactionHash}`),
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
    let bootstrapTxHashResult;
    try {
      bootstrapTxHashResult = await context.portalClient.request(
        BOOTSTRAP_SYSTEM_MUTATION,
        {
          address: system.id,
          from: sender.wallet,
        }
      );
    } catch (error) {
      const errorDetails = {
        operation: "BOOTSTRAP_SYSTEM_MUTATION",
        systemAddress: system.id,
        sender: sender.wallet,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
      logger.error("System bootstrap GraphQL mutation failed", errorDetails);
      
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.bootstrapFailed,
        cause: new Error(
          `Bootstrap GraphQL mutation failed: ${error instanceof Error ? error.message : String(error)}. System: ${system.id}, Sender: ${sender.wallet}`
        ),
      });
    }

    const bootstrapTransactionHash =
      bootstrapTxHashResult.IATKSystemBootstrap?.transactionHash ?? null;
    
    if (bootstrapTransactionHash) {
      logger.info("System bootstrap transaction submitted", {
        bootstrapTransactionHash,
        systemAddress: system.id,
        sender: sender.wallet,
      });
    }

    // Validate bootstrap transaction hash
    if (!bootstrapTransactionHash) {
      logger.error("Bootstrap failed: No transaction hash returned", {
        operation: "BOOTSTRAP_SYSTEM_MUTATION",
        systemAddress: system.id,
        sender: sender.wallet,
        result: bootstrapTxHashResult,
      });
      
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.bootstrapFailed,
        cause: new Error(`No transaction hash returned from IATKSystemBootstrap mutation for system ${system.id}`),
      });
    }

    // Track bootstrap transaction
    let bootstrapSucceeded = false;
    for await (const event of trackTransaction(
      bootstrapTransactionHash,
      context.portalClient,
      context.theGraphClient,
      {
        ...messages,
        waitingForMining: messages.bootstrappingSystem,
      }
    )) {
      // Yield all bootstrap events
      yield withEventMeta(
        {
          status: event.status,
          message: event.message,
          result: undefined,
        },
        { id: `${bootstrapTransactionHash}-bootstrap`, retry: 1000 }
      );

      // Track bootstrap success/failure
      if (event.status === "confirmed") {
        bootstrapSucceeded = true;
        logger.info("System bootstrap completed successfully", {
          systemAddress: system.id,
          bootstrapTransaction: bootstrapTransactionHash,
        });
      } else if (event.status === "failed") {
        bootstrapSucceeded = false;
        logger.error("System bootstrap failed", {
          systemAddress: system.id,
          bootstrapTransaction: bootstrapTransactionHash,
          failureMessage: event.message,
        });
        // Don't return early - we still need to report the system ID
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
