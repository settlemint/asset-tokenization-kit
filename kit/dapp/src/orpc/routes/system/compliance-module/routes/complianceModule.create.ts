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
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { permissionsMiddleware } from "@/orpc/middlewares/auth/permissions.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import {
  SystemComplianceModuleConfig,
  getDefaultComplianceModuleImplementations,
  type SystemComplianceModuleCreateOutput,
} from "@/orpc/routes/system/compliance-module/routes/complianceModule.create.schema";
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
  "identity-verification": "kycModuleFactory",
  "country-allow-list": "amlModuleFactory",
  "country-block-list": "sanctionsModuleFactory",
  "address-block-list": "sanctionsModuleFactory",
  "identity-block-list": "sanctionsModuleFactory",
  "identity-allow-list": "sanctionsModuleFactory",
} as const;

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

export const complianceModuleCreate =
  onboardedRouter.system.complianceModuleCreate
    .use(permissionsMiddleware({ system: ["create"] }))
    .use(theGraphMiddleware)
    .use(portalMiddleware)
    .use(systemMiddleware)
    .handler(async function* ({
      input,
      context,
    }): AsyncGenerator<SystemComplianceModuleCreateOutput, void, unknown> {
      const { contract, complianceModules, verification } = input;
      const sender = context.auth.user;
      const { t, system } = context;

      // Normalize to array
      const moduleList = Array.isArray(complianceModules)
        ? complianceModules
        : [complianceModules];
      const totalModules = moduleList.length;

      // Yield initial loading message
      yield {
        status: "pending" as const,
        message: t("system:compliance.messages.preparing"),
        progress: { current: 0, total: totalModules },
      };

      // Query existing compliance modules to check for duplicates
      const existingModuleTypes =
        system?.complianceModules.map((module) => module.typeId) ?? [];

      const results: SystemComplianceModuleCreateOutput["results"] = [];

      /**
       * Checks if an error contains a specific pattern
       */
      function containsErrorPattern(error: unknown, pattern: string): boolean {
        if (error instanceof Error) {
          return (
            error.message.includes(pattern) ||
            (error.stack?.includes(pattern) ?? false)
          );
        }
        if (typeof error === "string") {
          return error.includes(pattern);
        }
        return false;
      }

      // Process each compliance module using a generator pattern for batch operations
      for (const [index, moduleConfig] of moduleList.entries()) {
        const progress = { current: index + 1, total: totalModules };
        const { type } = moduleConfig;

        // Yield initial progress message for this module
        yield {
          status: "pending" as const,
          message: t("system:compliance.messages.progress", {
            current: progress.current,
            total: progress.total,
            type,
          }),
          currentComplianceModule: { type },
          progress,
        };

        // Check if module already exists (if we had that data)
        if (existingModuleTypes.some((existingType) => existingType === type)) {
          yield {
            status: "completed" as const,
            message: t("system:compliance.messages.alreadyExists", { type }),
            currentComplianceModule: { type },
            progress,
          };

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
            contract: contract,
            implementationAddress,
            userWallet: sender.wallet,
          });

          // Execute the compliance module registration transaction
          const variables: VariablesOf<
            typeof REGISTER_COMPLIANCE_MODULE_MUTATION
          > = {
            address: contract,
            from: sender.wallet,
            implementation: implementationAddress,
            ...(await handleChallenge(sender, {
              code: verification.verificationCode,
              type: verification.verificationType,
            })),
          };

          // Use the Portal client's mutate method that returns an async generator
          const transactionHash = yield* context.portalClient.mutate(
            REGISTER_COMPLIANCE_MODULE_MUTATION,
            variables,
            t("system:compliance.messages.failed", { name: type }),
            {
              waitingForMining: t("system:compliance.messages.registering", {
                name: type,
              }),
              transactionIndexed: t("system:compliance.messages.registered", {
                name: type,
              }),
            }
          );

          const implementationName =
            COMPLIANCE_TYPE_TO_IMPLEMENTATION_NAME[type];
          results.push({
            type,
            transactionHash,
            implementations: { [implementationName]: implementationAddress },
          });
        } catch (error) {
          // Handle any errors during compliance module registration
          const errorMessage =
            error instanceof Error
              ? error.message
              : t("system:compliance.messages.defaultError");

          // Enhanced error logging with more details
          logger.error(`Compliance module registration failed for ${name}:`, {
            error,
            errorMessage,
            errorStack: error instanceof Error ? error.stack : undefined,
            moduleConfig,
            contract,
            sender: sender.wallet,
            userWallet: sender.wallet,
            moduleType: type,
          });

          // Check for specific error patterns to provide better user feedback
          let specificErrorMessage = errorMessage;
          if (
            containsErrorPattern(error, "ComplianceModuleAlreadyRegistered")
          ) {
            specificErrorMessage = t(
              "system:compliance.messages.alreadyExists",
              {
                name,
              }
            );
          } else if (containsErrorPattern(error, "AccessControl")) {
            specificErrorMessage = t(
              "system:compliance.messages.accessDenied",
              {
                contract,
              }
            );
          } else if (containsErrorPattern(error, "Unauthorized")) {
            specificErrorMessage = t(
              "system:compliance.messages.accessDenied",
              {
                contract,
              }
            );
          } else if (containsErrorPattern(error, "implementation")) {
            specificErrorMessage = t(
              "system:compliance.messages.invalidImplementation"
            );
          } else if (containsErrorPattern(error, "invalid")) {
            specificErrorMessage = t(
              "system:compliance.messages.invalidConfiguration"
            );
          }

          yield {
            status: "failed" as const,
            message: t("system:compliance.messages.failed", { name: type }),
            currentComplianceModule: {
              type,
              error: specificErrorMessage,
            },
            progress,
          };

          results.push({
            type,
            error: specificErrorMessage,
          });
        }
      }

      // Calculate final results and determine completion message
      const successful = results.filter((r) => !r.error);
      const failed = results.filter((r) => r.error);

      // Yield final completion message
      let finalMessage: string;
      if (failed.length === 0) {
        finalMessage = t("system:compliance.messages.allSuccess", {
          count: successful.length,
        });
      } else if (successful.length === 0) {
        finalMessage = t("system:compliance.messages.allFailed");
      } else {
        finalMessage = t("system:compliance.messages.partialSuccess", {
          successCount: successful.length,
          totalCount: totalModules,
        });
      }

      yield {
        status: "completed" as const,
        message: finalMessage,
        results,
        result: results, // Added for useStreamingMutation hook compatibility
        progress: {
          current: totalModules,
          total: totalModules,
        },
      };
    });
