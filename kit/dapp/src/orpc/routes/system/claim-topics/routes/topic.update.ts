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
import { portalRouter } from "@/orpc/procedures/portal.router";
// No need to import SYSTEM_PERMISSIONS - using direct role requirements
import { keccak256, toHex } from "viem";
import {
  TopicUpdateOutputSchema,
  type TopicUpdateOutput,
} from "./topic.update.schema";

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
export const topicUpdate = portalRouter.system.topicUpdate
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: { any: ["claimPolicyManager", "systemManager"] },
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }): Promise<TopicUpdateOutput> => {
    const { system } = context;
    const { name, signature } = input;
    const sender = context.auth.user;

    // Validate system configuration
    const registryAddress = system?.topicSchemeRegistry;
    if (!registryAddress) {
      const cause = new Error("Topic scheme registry not found in system configuration");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    // Validate user session
    if (!sender?.blockchainAddress) {
      const cause = new Error("User wallet address not found");
      throw errors.UNAUTHORIZED({
        message: cause.message,
        cause,
      });
    }

    // Generate topic ID from name hash (for reference)
    const topicId = BigInt(keccak256(toHex(name)));

    // Check if this is a system topic (optional warning)
    const isSystemTopic = topicId >= 1n && topicId <= 100n;
    if (isSystemTopic) {
      console.warn(`Updating system-reserved topic: ${name} (ID: ${topicId})`);
    }

    try {
      // Execute the update transaction
      const result = await context.portal.request({
        document: UPDATE_TOPIC_SCHEME_MUTATION,
        variables: {
          address: registryAddress,
          from: sender.blockchainAddress,
          name,
          newSignature: signature,
          challengeId: context.challengeId,
          challengeResponse: context.challengeResponse,
        },
      });

      const transactionHash =
        result.IATKTopicSchemeRegistryUpdateTopicScheme?.transactionHash;

      if (!transactionHash) {
        const cause = new Error("Failed to update topic scheme - no transaction hash returned");
        throw errors.INTERNAL_SERVER_ERROR({
          message: cause.message,
          cause,
        });
      }

      // Return success response with transaction details
      return TopicUpdateOutputSchema.parse({
        transactionHash,
        topicId: topicId.toString(),
        name,
        newSignature: signature,
      });
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("TopicSchemeDoesNotExist")) {
          throw errors.NOT_FOUND({
            message: `Topic scheme with name "${name}" does not exist`,
            cause: error,
          });
        }
        if (error.message.includes("SignatureUnchanged")) {
          throw errors.CONFLICT({
            message: "New signature is the same as the current signature",
            cause: error,
          });
        }
        if (error.message.includes("EmptySignature")) {
          throw errors.INTERNAL_SERVER_ERROR({
            message: "Topic signature cannot be empty",
            cause: error,
          });
        }
      }
      
      // Re-throw unknown errors
      throw error;
    }
  });