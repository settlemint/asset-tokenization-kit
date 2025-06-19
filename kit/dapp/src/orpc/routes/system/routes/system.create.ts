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

    // TODO: can we improve the error handling here and by default? It will come out as a generic 500 error.
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

    if (!transactionHash) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: messages.systemCreationFailed,
      });
    }

    // Track transaction with custom messages
    for await (const event of trackTransaction(
      transactionHash,
      context.portalClient,
      context.theGraphClient,
      messages // Pass the messages for transaction tracking
    )) {
      yield event;
    }

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
