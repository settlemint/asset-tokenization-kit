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
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
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
        from: sender.wallet ?? "",
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
      getEthereumHash(transactionHash),
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

    // Yield the final confirmed event with the system ID
    yield withEventMeta(
      {
        status: "confirmed",
        message: messages.systemCreated,
        result: system.id,
      },
      { id: transactionHash, retry: 1000 }
    );

    return;
  });
