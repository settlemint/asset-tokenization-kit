/**
 * Topic Scheme Update Handler
 *
 * This handler updates the signature of an existing topic scheme through the
 * ATKTopicSchemeRegistry contract. The signature defines how claims for a topic
 * should be verified. Only the signature can be updated - the topic name and ID
 * remain immutable once created.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization (CLAIM_POLICY_MANAGER_ROLE)
 * 2. Verifies the topic exists by generating its ID from the name
 * 3. Executes the update transaction via Portal GraphQL
 * 4. Returns transaction details and the topic information
 *
 * @see {@link ./topic.update.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client for transaction execution
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { type TopicUpdateOutput } from "./topic.update.schema";

/**
 * GraphQL mutation for updating a topic scheme's signature
 * Calls the updateTopicSchemeSignature function on the ATKTopicSchemeRegistry contract
 */
const UPDATE_TOPIC_SCHEME_MUTATION = portalGraphql(`
  mutation UpdateTopicSchemeMutation(
    $address: String!
    $from: String!
    $name: String!
    $newSignature: String!
    $challengeId: String
    $challengeResponse: String
  ) {
    IATKTopicSchemeRegistryUpdateTopicScheme(
      address: $address
      from: $from
      input: {
        name: $name
        newSignature: $newSignature
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Update the signature of an existing topic scheme
 *
 * Updates the function signature used for claim verification for a specific topic.
 * The topic must already exist in the registry. System-reserved topics (ID 1-100)
 * may have additional restrictions on updates.
 *
 * Required permissions: CLAIM_POLICY_MANAGER_ROLE or SYSTEM_MODULE_ROLE
 *
 * @param input - The topic update parameters
 * @param input.name - Name of the existing topic scheme to update
 * @param input.signature - New function signature for claim verification
 * @returns Transaction hash and updated topic information
 */
export const topicUpdate = systemRouter.system.claimTopics.topicUpdate
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.topicUpdate,
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context }): Promise<TopicUpdateOutput> => {
    const { system } = context;
    const { name, signature, walletVerification } = input;
    const sender = context.auth.user;

    const registryAddress = system.topicSchemeRegistry.id;

    // Execute the update transaction
    const txHash = await context.portalClient.mutate(
      UPDATE_TOPIC_SCHEME_MUTATION,
      {
        address: registryAddress,
        from: sender.wallet,
        name,
        newSignature: signature,
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Return success response with transaction details
    return {
      txHash,
      name,
      newSignature: signature,
    };
  });
