/**
 * System Addon Registration Handler
 *
 * This handler registers system addons through the ATKSystemAddonRegistry
 * using an async generator pattern for real-time transaction tracking and batch progress.
 * It supports registering different addon types (airdrops, yield, xvp) either
 * individually or in batch with live progress updates.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Processes addon registration requests (single or batch)
 * 3. Executes transactions via Portal GraphQL with real-time tracking
 * 4. Yields progress events for each addon registration
 * 5. Returns a summary of all registered addons
 * @generator
 * @see {@link ./system.addonCreate.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client with transaction tracking
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import type { Context } from "@/orpc/context/context";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { permissionsMiddleware } from "@/orpc/middlewares/auth/permissions.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { encodeFunctionData, getAddress } from "viem";
import {
  type SystemAddonConfig,
  type SystemAddonCreateOutput,
  getDefaultAddonImplementations,
} from "./system.addonCreate.schema";

const logger = createLogger();

/**
 * GraphQL mutation for registering a system addon.
 * @param address - The system addon registry contract address
 * @param from - The wallet address initiating the transaction
 * @param name - The name for the addon
 * @param implementation - The implementation contract address
 * @param initializationData - The initialization data for the addon
 * @param verificationId - Optional verification ID for the challenge
 * @param challengeResponse - The MFA challenge response for transaction authorization
 * @returns transactionHash - The blockchain transaction hash for tracking
 */
const REGISTER_SYSTEM_ADDON_MUTATION = portalGraphql(`
  mutation RegisterSystemAddonMutation(
    $address: String!
    $from: String!
    $name: String!
    $implementation: String!
    $initializationData: String!
    $verificationId: String
    $challengeResponse: String!
  ) {
    ATKSystemAddonRegistryImplementationRegisterSystemAddon(
      address: $address
      from: $from
      input: {
        name: $name
        implementation_: $implementation
        initializationData: $initializationData
      }
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Maps addon types to their primary implementation names
 */
const ADDON_TYPE_TO_IMPLEMENTATION_NAME = {
  airdrops: "pushAirdropFactory", // Default to push airdrop for now
  yield: "fixedYieldScheduleFactory",
  xvp: "xvpSettlementFactory",
} as const;

/**
 * Generates initialization data for different addon types
 */
function generateInitializationData(context: Context): string {
  const systemAddress = getAddress(context.system?.address ?? "");
  const initialAdmin = getAddress(context.auth?.user.wallet ?? "");
  return encodeFunctionData({
    abi: [
      {
        type: "function",
        name: "initialize",
        inputs: [
          {
            name: "systemAddress_",
            type: "address",
            internalType: "address",
          },
          {
            name: "initialAdmin_",
            type: "address",
            internalType: "address",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
    ],
    functionName: "initialize",
    args: [systemAddress, initialAdmin],
  });
}

/**
 * Gets the implementation address for an addon configuration
 */
function getImplementationAddress(addonConfig: SystemAddonConfig): string {
  const defaults = getDefaultAddonImplementations(addonConfig.type);
  const implementationName =
    ADDON_TYPE_TO_IMPLEMENTATION_NAME[addonConfig.type];

  // Use custom implementation if provided, otherwise use default
  if (addonConfig.implementations?.[implementationName]) {
    return addonConfig.implementations[implementationName];
  }

  // Get the implementation from defaults
  const defaultImplementation = (defaults as Record<string, string>)[
    implementationName
  ];
  if (!defaultImplementation) {
    throw new Error(
      `No implementation found for addon type: ${addonConfig.type}`
    );
  }

  return defaultImplementation;
}

/**
 * Creates system addons using async iteration for progress tracking.
 *
 * This handler uses a generator pattern to yield real-time progress updates during
 * addon registration, supporting both single and batch operations with detailed status
 * for each addon being registered.
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client with transaction tracking
 * @middleware theGraphMiddleware - Provides TheGraph client
 * @middleware systemMiddleware - Provides system context and addon registry
 * @param input.contract - The system addon registry contract address
 * @param input.addons - Single addon or array of addons to register
 * @param input.messages - Optional custom messages for localization
 * @param input.verification - The verification code and type for the transaction
 * @yields {SystemAddonCreateOutput} Progress events with status, message, and current addon info
 * @returns {AsyncGenerator} Generator that yields events and completes with registration summary
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If system not bootstrapped or transaction fails
 */
export const addonCreate = onboardedRouter.system.addonCreate
  .use(permissionsMiddleware({ system: ["create"] }))
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .use(systemMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, addons, verification } = input;
    const sender = context.auth.user;
    const { t } = context;

    // Normalize to array
    const addonList = Array.isArray(addons) ? addons : [addons];
    const totalAddons = addonList.length;

    // Yield initial loading message
    yield {
      status: "pending" as const,
      message: t("system:addons.messages.preparing"),
      progress: { current: 0, total: totalAddons },
    };

    // Query existing system addons to check for duplicates
    const existingAddonNames = new Set<string>();
    try {
      // Note: We would need to add systemAddons to the system middleware
      // For now, we'll proceed without duplicate checking and let the contract handle it
      logger.debug(
        "System context available, proceeding with addon registration"
      );
    } catch (error) {
      logger.debug(`Could not fetch existing addons: ${error}`);
    }

    const results: SystemAddonCreateOutput["results"] = [];

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

    // Process each addon using a generator pattern for batch operations
    for (const [index, addonConfig] of addonList.entries()) {
      const progress = { current: index + 1, total: totalAddons };
      const { type, name } = addonConfig;

      // Yield initial progress message for this addon
      yield {
        status: "pending" as const,
        message: t("system:addons.messages.progress", {
          current: progress.current,
          total: progress.total,
          type,
          name,
        }),
        currentAddon: { type, name },
        progress,
      };

      // Check if addon already exists (if we had that data)
      if (existingAddonNames.has(name.toLowerCase())) {
        yield {
          status: "completed" as const,
          message: t("system:addons.messages.alreadyExists", { name }),
          currentAddon: { type, name },
          progress,
        };

        results.push({
          type,
          name,
          transactionHash: "",
          error: "Addon already exists",
        });

        continue; // Skip to next addon
      }

      try {
        // Get implementation address and initialization data
        const implementationAddress = getImplementationAddress(addonConfig);
        const initializationData = generateInitializationData(context);

        // Log the implementation details for debugging
        logger.info(`Registering addon with details:`, {
          addonType: type,
          addonName: name,
          contract: contract,
          implementationAddress,
          initializationData,
          userWallet: sender.wallet,
        });

        // Execute the addon registration transaction
        const variables: VariablesOf<typeof REGISTER_SYSTEM_ADDON_MUTATION> = {
          address: contract,
          from: sender.wallet,
          name: name,
          implementation: implementationAddress,
          initializationData: initializationData,
          ...(await handleChallenge(sender, {
            code: verification.verificationCode,
            type: verification.verificationType,
          })),
        };

        // Use the Portal client's mutate method that returns an async generator
        const transactionHash = yield* context.portalClient.mutate(
          REGISTER_SYSTEM_ADDON_MUTATION,
          variables,
          t("system:addons.messages.failed", { name }),
          {
            waitingForMining: t("system:addons.messages.registering", { name }),
            transactionIndexed: t("system:addons.messages.registered", {
              name,
            }),
          }
        );

        const implementationName = ADDON_TYPE_TO_IMPLEMENTATION_NAME[type];
        results.push({
          type,
          name,
          transactionHash,
          implementations: { [implementationName]: implementationAddress },
        });
      } catch (error) {
        // Handle any errors during addon registration
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("system:addons.messages.defaultError");

        // Enhanced error logging with more details
        logger.error(`Addon registration failed for ${name}:`, {
          error,
          errorMessage,
          errorStack: error instanceof Error ? error.stack : undefined,
          addonConfig,
          implementationAddress: (() => {
            try {
              return getImplementationAddress(addonConfig);
            } catch (e) {
              return `Error getting implementation: ${e instanceof Error ? e.message : e}`;
            }
          })(),
          contract,
          sender: sender.wallet,
          userWallet: sender.wallet,
          addonType: type,
          addonName: name,
        });

        // Check for specific error patterns to provide better user feedback
        let specificErrorMessage = errorMessage;
        if (containsErrorPattern(error, "SystemAddonTypeAlreadyRegistered")) {
          specificErrorMessage = t("system:addons.messages.alreadyExists", {
            name,
          });
        } else if (containsErrorPattern(error, "AccessControl")) {
          specificErrorMessage = t("system:addons.messages.accessDenied", {
            contract,
          });
        } else if (containsErrorPattern(error, "Unauthorized")) {
          specificErrorMessage = t("system:addons.messages.accessDenied", {
            contract,
          });
        } else if (containsErrorPattern(error, "implementation")) {
          specificErrorMessage = t(
            "system:addons.messages.invalidImplementation"
          );
        } else if (containsErrorPattern(error, "invalid")) {
          specificErrorMessage = t(
            "system:addons.messages.invalidConfiguration"
          );
        }

        yield {
          status: "failed" as const,
          message: t("system:addons.messages.failed", { name }),
          currentAddon: { type, name, error: specificErrorMessage },
          progress,
        };

        results.push({
          type,
          name,
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
      finalMessage = t("system:addons.messages.allSuccess", {
        count: successful.length,
      });
    } else if (successful.length === 0) {
      finalMessage = t("system:addons.messages.allFailed");
    } else {
      finalMessage = t("system:addons.messages.partialSuccess", {
        successCount: successful.length,
        totalCount: totalAddons,
      });
    }

    yield {
      status: "completed" as const,
      message: finalMessage,
      results,
      result: results, // Added for useStreamingMutation hook compatibility
      progress: {
        current: totalAddons,
        total: totalAddons,
      },
    };
  });
