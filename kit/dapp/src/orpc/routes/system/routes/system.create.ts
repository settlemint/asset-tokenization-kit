/**
 * System Creation Handler
 *
 * This handler creates a new system contract instance through the ATKSystemFactory.
 * System contracts are fundamental infrastructure components in the SettleMint
 * platform that manage various system-level operations and configurations.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Creates the system contract via Portal GraphQL
 * 3. Queries TheGraph to get the deployed system contract address
 * 4. Bootstraps the system contract to initialize its state
 * 5. Returns the system contract address
 * @see {@link ../system.create.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { read as settingsRead } from "@/orpc/routes/settings/routes/settings.read";
import { upsert } from "@/orpc/routes/settings/routes/settings.upsert";
import { read } from "@/orpc/routes/system/routes/system.read";
import { call } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { z } from "zod";

/**
 * GraphQL mutation for creating a new system contract instance.
 * @param address - The factory contract address to call
 * @param from - The wallet address initiating the transaction
 * @param challengeResponse - The MFA challenge response for transaction authorization
 * @param verificationId - Optional verification ID for the challenge
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const CREATE_SYSTEM_MUTATION = portalGraphql(`
  mutation CreateSystemMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $from: String!
  ) {
    ATKSystemFactoryCreateSystem(
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
    ) {
      transactionHash
    }
  }
`);

const GRANT_ROLE_MUTATION = portalGraphql(`
  mutation GrantRoleMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $to: String!
    $role: String!
    $from: String!
  ) {
    IATKSystemAccessManagerGrantRole(
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
      input: { account: $to, role: $role }
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for bootstrapping a system contract.
 * @param address - The system contract address to bootstrap
 * @param from - The wallet address initiating the transaction
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const BOOTSTRAP_SYSTEM_MUTATION = portalGraphql(`
  mutation BootstrapSystemMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $from: String!
  ) {
    IATKSystemBootstrap(
      verificationId: $verificationId
      challengeResponse: $challengeResponse
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
 * This handler creates and bootstraps a system contract.
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client
 * @middleware theGraphMiddleware - Provides TheGraph client for querying deployed contracts
 * @param input.contract - The system factory contract address (defaults to standard address)
 * @param input.messages - Optional custom messages for localization
 * @param input.verification - The verification code and type for the transaction
 * @returns {Promise<string>} The system contract address
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If system creation or bootstrapping fails
 * @example
 * ```typescript
 * // Create system
 * const systemAddress = await client.system.create({
 *   contract: "0x123..."
 * });
 * console.log(`System created at: ${systemAddress}`);
 *
 * // Or use with React hooks
 * const { mutate } = client.system.create.useMutation();
 * ```
 */
export const create = onboardedRouter.system.create
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { system: ["create"] },
    })
  )
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { contract, verification } = input;
    const sender = context.auth.user;
    // const { t } = context; // Removed - using hardcoded messages

    // Check if system already exists using orpc
    const existingSystem = await call(
      settingsRead,
      {
        key: "SYSTEM_ADDRESS",
      },
      { context }
    );

    if (existingSystem) {
      throw errors.RESOURCE_ALREADY_EXISTS({
        message: "System already exists",
        cause: new Error(
          `System already deployed at address: ${existingSystem}`
        ),
      });
    }

    // Handle challenge for system creation transaction
    const createChallengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Execute the system creation transaction
    const createSystemVariables: VariablesOf<typeof CREATE_SYSTEM_MUTATION> = {
      address: contract,
      from: sender.wallet,
      ...createChallengeResponse,
    };

    // Use the Portal client's mutate method
    const transactionHash = await context.portalClient.mutate(
      CREATE_SYSTEM_MUTATION,
      createSystemVariables,
      "Failed to create system"
    );

    // Query for the deployed system contract
    const queryVariables: VariablesOf<
      typeof FIND_SYSTEM_FOR_TRANSACTION_QUERY
    > = {
      deployedInTransaction: transactionHash,
    };

    // Define the schema for the query result
    const SystemQueryResultSchema = z.object({
      systems: z.array(
        z.object({
          id: z.string(),
        })
      ),
    });

    const result = await context.theGraphClient.query(
      FIND_SYSTEM_FOR_TRANSACTION_QUERY,
      {
        input: queryVariables,
        output: SystemQueryResultSchema,
        error: "Failed to create system",
      }
    );

    if (result.systems.length === 0) {
      throw errors.NOT_FOUND({
        message: "System not found after creation",
        cause: new Error(`System not found for transaction ${transactionHash}`),
      });
    }

    const systems = result.systems;

    const system = systems[0];

    if (!system) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create system",
        cause: new Error(
          `System object is null for transaction ${transactionHash}`
        ),
      });
    }

    // Handle challenge for bootstrap transaction (fresh challenge required)
    const bootstrapChallengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Execute the bootstrap transaction
    const bootstrapVariables: VariablesOf<typeof BOOTSTRAP_SYSTEM_MUTATION> = {
      address: system.id,
      from: sender.wallet,
      ...bootstrapChallengeResponse,
    };

    // Execute bootstrap transaction

    await context.portalClient.mutate(
      BOOTSTRAP_SYSTEM_MUTATION,
      bootstrapVariables,
      "Failed to bootstrap system"
    );

    // Save the system address to settings using orpc BEFORE yielding final events
    await call(
      upsert,
      {
        key: "SYSTEM_ADDRESS",
        value: system.id,
      },
      { context }
    );

    const systemDetails = await call(
      read,
      {
        id: system.id,
      },
      { context }
    );

    // Grant roles to the contracts
    if (systemDetails.systemAccessManager) {
      const requiresAdminRole = [
        systemDetails.tokenFactoryRegistry,
        systemDetails.systemAddonRegistry,
      ].filter((contract) => contract !== null);

      for (const contract of requiresAdminRole) {
        const grantRoleChallengeResponse = await handleChallenge(sender, {
          code: verification.verificationCode,
          type: verification.verificationType,
        });

        await context.portalClient.mutate(
          GRANT_ROLE_MUTATION,
          {
            address: systemDetails.systemAccessManager,
            from: sender.wallet,
            to: contract,
            role: "0x0000000000000000000000000000000000000000000000000000000000000000", // DEFAULT_ADMIN_ROLE
            ...grantRoleChallengeResponse,
          },
          "Failed to grant default admin role"
        );
      }
    }

    // Return the complete system details
    return systemDetails;
  });
