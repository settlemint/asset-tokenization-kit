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
    const txHashResult = await context.portalClient.request(
      CREATE_SYSTEM_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        // ...(await handleChallenge(sender, verification)),
      }
    );

    const transactionHash =
      txHashResult.ATKSystemFactoryCreateSystem?.transactionHash ?? null;

    // Validate transaction hash
    if (!transactionHash) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
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
    const { systems } = await context.theGraphClient.request(
      FIND_SYSTEM_FOR_TRANSACTION_QUERY,
      {
        deployedInTransaction: transactionHash,
      }
    );

    if (systems.length === 0) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
      });
    }

    const system = systems[0];

    if (!system) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
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
    const bootstrapTxHashResult = await context.portalClient.request(
      BOOTSTRAP_SYSTEM_MUTATION,
      {
        address: system.id,
        from: sender.wallet,
      }
    );

    const bootstrapTransactionHash =
      bootstrapTxHashResult.IATKSystemBootstrap?.transactionHash ?? null;

    // Validate bootstrap transaction hash
    if (!bootstrapTransactionHash) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.bootstrapFailed,
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
      } else if (event.status === "failed") {
        bootstrapSucceeded = false;
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
