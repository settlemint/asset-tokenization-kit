/**
 * Topic Scheme Registration Handler
 *
 * This handler registers new topic schemes through the ATKTopicSchemeRegistry contract.
 * Topic schemes define the structure and validation logic for claims that can be issued
 * about identities. Each topic has a unique ID generated from its name hash and a
 * function signature that defines how claims for that topic should be verified.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization (CLAIM_POLICY_MANAGER_ROLE)
 * 2. Generates a topic ID from the name using keccak256 hash
 * 3. Executes the registration transaction via Portal GraphQL
 * 4. Returns transaction details and the generated topic ID
 *
 * @see {@link ./topic.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client for transaction execution
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
// No need to import SYSTEM_PERMISSIONS - using direct role requirements
import {
  TopicCreateOutputSchema,
  type TopicCreateOutput,
} from "./topic.create.schema";

/**
 * GraphQL mutation for registering a new topic scheme
 * Calls the registerTopicScheme function on the ATKTopicSchemeRegistry contract
 */
const REGISTER_TOPIC_SCHEME_MUTATION = portalGraphql(`
  mutation RegisterTopicSchemeMutation(
    $address: String!
    $from: String!
    $name: String!
    $signature: String!
    $challengeId: String
    $challengeResponse: String
  ) {
    IATKTopicSchemeRegistryRegisterTopicScheme(
      address: $address
      from: $from
      input: {
        name: $name
        signature: $signature
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Create a new topic scheme in the registry
 *
 * Registers a new topic scheme that can be used for identity claims.
 * The topic ID is automatically generated from the hash of the topic name.
 *
 * Required permissions: CLAIM_POLICY_MANAGER_ROLE or SYSTEM_MODULE_ROLE
 *
 * @param input - The topic creation parameters
 * @param input.name - Human-readable name for the topic (must be unique)
 * @param input.signature - Function signature for claim verification
 * @returns Transaction hash and generated topic ID
 */
export const topicCreate = portalRouter.system.topicCreate
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: { any: ["claimPolicyManager", "systemManager"] },
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }): Promise<TopicCreateOutput> => {
    const { system } = context;
    const { name, signature } = input;
    const sender = context.auth.user;

    // Validate system configuration
    const registryAddress = system?.topicSchemeRegistry;
    if (!registryAddress) {
      const cause = new Error(
        "Topic scheme registry not found in system configuration"
      );
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    // Execute the registration transaction
    const transactionHash = await context.portalClient.mutate(
      REGISTER_TOPIC_SCHEME_MUTATION,
      {
        address: registryAddress,
        from: sender.wallet,
        name,
        signature,
      }
    );

    // Return success response with transaction details
    return TopicCreateOutputSchema.parse({
      transactionHash,
      name,
    });
  });
