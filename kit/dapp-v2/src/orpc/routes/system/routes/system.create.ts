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
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { ar } from "@/orpc/procedures/auth.router";

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
  mutation CreateSystemMutation($address: String!, $from: String!, $challengeResponse: String!, $verificationId: String) {
    ATKSystemFactoryCreateSystem(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
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
export const create = ar.system.create
  .use(portalMiddleware)
  .handler(async ({ input, context }) => {
    const { contract, verification } = input;
    const sender = context.auth.user;

    // TODO: can we improve the error handling here and by default? It will come out as a generic 500 error.
    const result = await context.portalClient.request(CREATE_SYSTEM_MUTATION, {
      address: contract,
      from: sender.wallet,
      ...(await handleChallenge(sender, verification)),
    });

    return getEthereumHash(
      result.ATKSystemFactoryCreateSystem?.transactionHash
    );
  });
