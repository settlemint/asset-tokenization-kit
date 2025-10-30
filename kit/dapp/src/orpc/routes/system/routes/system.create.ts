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
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { read as settingsRead } from "@/orpc/routes/settings/routes/settings.read";
import { upsert } from "@/orpc/routes/settings/routes/settings.upsert";
import { grantRole } from "@/orpc/routes/system/access-manager/routes/grant-role";
import { complianceModuleCreate } from "@/orpc/routes/system/compliance-module/routes/compliance-module.create";
import { read } from "@/orpc/routes/system/routes/system.read";
import type { SystemAccessControlRoles } from "@atk/zod/access-control-roles";
import { call } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { z } from "zod";

const logger = createLogger();

/**
 * GraphQL mutation for creating a new system contract instance.
 * @param address - The factory contract address to call
 * @param from - The wallet address initiating the transaction
 * @param challengeResponse - The MFA challenge response for transaction authorization
 * @param challengeId - Optional verification ID for the challenge
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const CREATE_SYSTEM_MUTATION = portalGraphql(`
  mutation CreateSystemMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    ATKSystemFactoryCreateSystem(
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
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
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    IATKSystemBootstrap(
      challengeId: $challengeId
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
  .handler(async ({ input, context, errors }) => {
    const { contract, walletVerification } = input;
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

    // Execute the system creation transaction
    const createSystemVariables = {
      address: contract,
      from: sender.wallet,
    };

    // Use the Portal client's mutate method
    const transactionHash = await context.portalClient.mutate(
      CREATE_SYSTEM_MUTATION,
      createSystemVariables,
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
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

    // Execute the bootstrap transaction
    const bootstrapVariables = {
      address: system.id,
      from: sender.wallet,
    };

    // Execute bootstrap transaction
    await context.portalClient.mutate(
      BOOTSTRAP_SYSTEM_MUTATION,
      bootstrapVariables,
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
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

    // Grant operational roles to the system creator
    // These roles are required for managing various aspects of the system
    const operationalRoles: SystemAccessControlRoles[] = [
      "tokenManager",
      "identityManager",
      "complianceManager",
      "addonManager",
    ];
    // Grant all operational roles in a single transaction
    await call(
      grantRole,
      {
        address: sender.wallet,
        role: operationalRoles,
        walletVerification,
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

    // Create all compliance modules if compliance module registry exists
    if (systemDetails.complianceModuleRegistry) {
      try {
        await call(
          complianceModuleCreate,
          {
            complianceModules: "all",
            walletVerification,
          },
          { context }
        );
      } catch (error) {
        // Log but don't fail system creation
        logger.error("Failed to create compliance modules", error);
      }
    }

    const updatedSystemDetails = await call(
      read,
      {
        id: system.id,
      },
      { context }
    );

    // Return the complete system details
    return updatedSystemDetails;
  });
