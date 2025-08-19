/**
 * Topic Scheme Removal Handler
 *
 * This handler removes an existing topic scheme from the ATKTopicSchemeRegistry contract.
 * Removing a topic scheme will prevent new claims from being issued for that topic,
 * but existing claims will remain valid. This is a destructive operation and should
 * be used with caution.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization (CLAIM_POLICY_MANAGER_ROLE)
 * 2. Generates the topic ID from the name for reference
 * 3. Executes the removal transaction via Portal GraphQL
 * 4. Returns transaction details and the removed topic information
 * 
 * Note: System-reserved topics (ID 1-100) may have additional restrictions or
 * may not be removable depending on the contract implementation.
 * 
 * @see {@link ./topic.delete.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client for transaction execution
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
// No need to import SYSTEM_PERMISSIONS - using direct role requirements
import { keccak256, toHex } from "viem";
import {
  TopicDeleteOutputSchema,
  type TopicDeleteOutput,
} from "./topic.delete.schema";

/**
 * GraphQL mutation for removing a topic scheme
 * Calls the removeTopicScheme function on the ATKTopicSchemeRegistry contract
 */
const REMOVE_TOPIC_SCHEME_MUTATION = portalGraphql(`
  mutation RemoveTopicSchemeMutation(
    $address: String!
    $from: String!
    $name: String!
    $challengeId: String
    $challengeResponse: String
  ) {
    IATKTopicSchemeRegistryRemoveTopicScheme(
      address: $address
      from: $from
      input: {
        name: $name
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Remove a topic scheme from the registry
 * 
 * Permanently removes a topic scheme from the registry. This prevents new claims
 * from being issued for this topic. Existing claims remain valid but new ones
 * cannot be created. This operation cannot be undone.
 * 
 * Warning: Removing a topic that is actively used by trusted issuers may break
 * claim verification flows. Ensure the topic is no longer needed before removal.
 * 
 * Required permissions: CLAIM_POLICY_MANAGER_ROLE or SYSTEM_MODULE_ROLE
 * 
 * @param input - The topic removal parameters
 * @param input.name - Name of the topic scheme to remove
 * @returns Transaction hash and removed topic information
 */
export const topicDelete = portalRouter.system.topicDelete
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: { any: ["claimPolicyManager", "systemManager"] },
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }): Promise<TopicDeleteOutput> => {
    const { system } = context;
    const { name } = input;
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

    // Check if this is a system topic and warn
    const isSystemTopic = topicId >= 1n && topicId <= 100n;
    if (isSystemTopic) {
      console.warn(`Attempting to remove system-reserved topic: ${name} (ID: ${topicId})`);
      // Note: The contract may prevent this operation for system topics
    }

    try {
      // Execute the removal transaction
      const result = await context.portal.request({
        document: REMOVE_TOPIC_SCHEME_MUTATION,
        variables: {
          address: registryAddress,
          from: sender.blockchainAddress,
          name,
          challengeId: context.challengeId,
          challengeResponse: context.challengeResponse,
        },
      });

      const transactionHash =
        result.IATKTopicSchemeRegistryRemoveTopicScheme?.transactionHash;

      if (!transactionHash) {
        const cause = new Error("Failed to remove topic scheme - no transaction hash returned");
        throw errors.INTERNAL_SERVER_ERROR({
          message: cause.message,
          cause,
        });
      }

      // Return success response with transaction details
      return TopicDeleteOutputSchema.parse({
        transactionHash,
        topicId: topicId.toString(),
        name,
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
        if (error.message.includes("SystemTopicCannotBeRemoved")) {
          throw errors.FORBIDDEN({
            message: `System-reserved topic "${name}" cannot be removed`,
            cause: error,
          });
        }
        if (error.message.includes("TopicInUse")) {
          throw errors.CONFLICT({
            message: `Topic "${name}" is currently assigned to trusted issuers and cannot be removed`,
            cause: error,
          });
        }
      }
      
      // Re-throw unknown errors
      throw error;
    }
  });