/**
 * Compliance Module Registration Handler
 *
 * This handler registers compliance modules through the ATKSystemComplianceModuleRegistry
 * using an async generator pattern for real-time transaction tracking and batch progress.
 * It supports registering different compliance module types (e.g., KYC, AML, sanctions screening)
 * either individually or in batch with live progress updates.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Processes compliance module registration requests (single or batch)
 * 3. Executes transactions via Portal GraphQL with real-time tracking
 * 4. Yields progress events for each compliance module registration
 * 5. Returns a summary of all registered compliance modules
 * @generator
 * @see {@link ./system.complianceModuleCreate.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { complianceTypeIds } from "@/lib/zod/validators/compliance";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import {
  getDefaultComplianceModuleImplementations,
  SystemComplianceModuleConfig,
  type SystemComplianceModuleCreateOutput,
} from "@/orpc/routes/system/compliance-module/routes/compliance-module.create.schema";
import { read } from "@/orpc/routes/system/routes/system.read";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { call } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

const REGISTER_COMPLIANCE_MODULE_MUTATION = portalGraphql(`
 mutation RegisterComplianceModuleMutation(
    $address: String!
    $from: String!
    $implementation: String!
    $verificationId: String
    $challengeResponse: String!
  ) {
    IATKComplianceModuleRegistryRegisterComplianceModule(
      address: $address
      from: $from
      input: {
        moduleAddress: $implementation
      }
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const COMPLIANCE_TYPE_TO_IMPLEMENTATION_NAME = {
  SMARTIdentityVerificationComplianceModule: "kycModuleFactory",
  CountryAllowListComplianceModule: "amlModuleFactory",
  CountryBlockListComplianceModule: "sanctionsModuleFactory",
  AddressBlockListComplianceModule: "sanctionsModuleFactory",
  IdentityBlockListComplianceModule: "sanctionsModuleFactory",
  IdentityAllowListComplianceModule: "sanctionsModuleFactory",
};

/**
 * Gets the implementation address for a compliance module configuration
 */
function getComplianceImplementationAddress(
  moduleConfig: SystemComplianceModuleConfig
): string {
  const implementationName =
    COMPLIANCE_TYPE_TO_IMPLEMENTATION_NAME[moduleConfig.type];

  // Use custom implementation if provided, otherwise use default
  if (moduleConfig.implementations?.[implementationName]) {
    return moduleConfig.implementations[implementationName];
  }

  // Get the default implementation for the compliance module type
  const defaultImplementation = getDefaultComplianceModuleImplementations(
    moduleConfig.type
  );
  if (!defaultImplementation) {
    throw new Error(
      `No implementation found for compliance module type: ${moduleConfig.type}`
    );
  }

  return defaultImplementation;
}

export const complianceModuleCreate = portalRouter.system.complianceModuleCreate
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.complianceModuleCreate,
      getAccessControl: ({ context }) => {
        const systemData = context.system;
        return systemData?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { complianceModules, verification } = input;
    const sender = context.auth.user;
    const { system } = context;

    const contract = system?.complianceModuleRegistry;
    if (!contract) {
      const cause = new Error("System compliance module registry not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    const moduleList = getModuleList(complianceModules);

    // Query existing system compliance modules to check for duplicates
    const existingComplianceModuleTypeIds =
      system?.complianceModules.map(
        (complianceModule) => complianceModule.typeId
      ) ?? [];

    const results: SystemComplianceModuleCreateOutput["results"] = [];

    // Process each addon using a generator pattern for batch operations
    for (const moduleConfig of moduleList) {
      const { type } = moduleConfig;

      // Check if module already exists (if we had that data)
      if (existingComplianceModuleTypeIds.includes(type)) {
        results.push({
          type,
          transactionHash: "",
          error: "Compliance module already exists",
        });

        continue; // Skip to next module
      }

      try {
        // Get implementation address and initialization data
        const implementationAddress =
          getComplianceImplementationAddress(moduleConfig);

        // Log the implementation details for auditing
        logger.info(`Registering compliance module with details:`, {
          moduleType: type,
          contract,
          implementationAddress,
          userWallet: sender.wallet,
        });

        // Every transaction needs a challenge response (can only be used once)
        const challengeResponse = await handleChallenge(sender, {
          code: verification.verificationCode,
          type: verification.verificationType,
        });

        // Execute the compliance module registration transaction
        const variables: VariablesOf<
          typeof REGISTER_COMPLIANCE_MODULE_MUTATION
        > = {
          address: contract,
          from: sender.wallet,
          implementation: implementationAddress,
          ...challengeResponse,
        };

        // Execute the mutation
        const transactionHash = await context.portalClient.mutate(
          REGISTER_COMPLIANCE_MODULE_MUTATION,
          variables
        );

        const implementationName = COMPLIANCE_TYPE_TO_IMPLEMENTATION_NAME[type];
        results.push({
          type,
          transactionHash,
          implementations: { [implementationName]: implementationAddress },
        });
      } catch (error) {
        results.push({
          type,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // We don't need the final message anymore since we're returning the system

    // Return the updated system details
    return await call(
      read,
      {
        id: system.address,
      },
      { context }
    );
  });

/**
 * Resolves compliance modules from input - either "all" or specific configurations
 */
function getModuleList(
  complianceModules:
    | "all"
    | SystemComplianceModuleConfig
    | SystemComplianceModuleConfig[]
): SystemComplianceModuleConfig[] {
  if (complianceModules === "all") {
    return complianceTypeIds.map((type) => ({ type }));
  }
  return Array.isArray(complianceModules)
    ? complianceModules
    : [complianceModules];
}
