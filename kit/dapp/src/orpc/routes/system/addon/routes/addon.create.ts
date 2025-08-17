/**
 * System Addon Registration Handler
 *
 * This handler registers system addons through the ATKSystemAddonRegistry.
 * It supports registering different addon types (airdrops, yield, xvp) either
 * individually or in batch.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication and authorization
 * 2. Processes addon registration requests (single or batch)
 * 3. Executes transactions via Portal GraphQL
 * 4. Returns a summary of all registered addons
 * @see {@link ./system.addonCreate.schema} - Input validation schema
 * @see {@link @/lib/settlemint/portal} - Portal GraphQL client
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import type { Context } from "@/orpc/context/context";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { read } from "@/orpc/routes/system/routes/system.read";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { call } from "@orpc/server";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { encodeFunctionData, getAddress } from "viem";
import {
  type SystemAddonConfig,
  getDefaultAddonImplementations,
} from "./addon.create.schema";

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
  // The addon factories expect accessManager as first param and systemAddress as second
  const accessManagerAddress = getAddress(
    context.system?.systemAccessManager?.id ?? ""
  );
  const systemAddress = getAddress(context.system?.address ?? "");

  return encodeFunctionData({
    abi: [
      {
        type: "function",
        name: "initialize",
        inputs: [
          {
            name: "accessManager",
            type: "address",
            internalType: "address",
          },
          {
            name: "systemAddress",
            type: "address",
            internalType: "address",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
    ],
    functionName: "initialize",
    args: [accessManagerAddress, systemAddress],
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
 * Creates system addons.
 *
 * This handler registers system addons, supporting both single and batch operations.
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client
 * @middleware theGraphMiddleware - Provides TheGraph client
 * @middleware systemMiddleware - Provides system context and addon registry
 * @param input.contract - The system addon registry contract address
 * @param input.addons - Single addon or array of addons to register
 * @param input.messages - Optional custom messages for localization
 * @param input.verification - The verification code and type for the transaction
 * @returns {Promise<SystemAddonCreateOutput>} Registration summary with results for each addon
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If system not bootstrapped or transaction fails
 */
export const addonCreate = portalRouter.system.addonCreate
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.addonCreate,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { addons } = input;
    const sender = context.auth.user;
    const { system } = context;

    if (!system?.systemAddonRegistry) {
      const cause = new Error("System addon registry not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    // Store registry address to satisfy TypeScript's null checks
    const systemAddonRegistry = system.systemAddonRegistry;

    // Normalize to array
    const addonList = Array.isArray(addons) ? addons : [addons];

    // Query existing system addons using the system context
    let existingAddonNames = new Set<string>();
    try {
      const systemData = context.system;

      existingAddonNames = new Set(
        systemData.systemAddons.map((addon) => addon.name.toLowerCase())
      );
    } catch (error) {
      // If we can't fetch existing addons, proceed anyway
      // The contract will reject duplicates
      logger.debug(`Could not fetch existing addons: ${String(error)}`);
    }

    // Filter out existing addons
    const addonsToRegister = addonList.filter(
      (addon) => !existingAddonNames.has(addon.name.toLowerCase())
    );

    // Process addons sequentially - parallel challenge generation not working
    const results = [];

    for (const addonConfig of addonsToRegister) {
      const { name } = addonConfig;

      try {
        // Get implementation address and initialization data
        const implementationAddress = getImplementationAddress(addonConfig);
        const initializationData = generateInitializationData(context);

        // Generate a fresh challenge response for each addon
        

        // Execute the addon registration transaction
        const variables: VariablesOf<typeof REGISTER_SYSTEM_ADDON_MUTATION> = {
          address: systemAddonRegistry,
          from: sender.wallet,
          name: name,
          implementation: implementationAddress,
          initializationData: initializationData,
          
        };

        // Use the Portal client's mutate method that returns the transaction hash
        const txHash = await context.portalClient.mutate(
          REGISTER_SYSTEM_ADDON_MUTATION,
          variables
        );

        results.push({ status: "success" as const, addon: name, txHash });
        logger.info(`Addon ${name} registered successfully`);
      } catch (error) {
        logger.error(`Failed to create addon ${name}:`, error);
        results.push({ status: "failed" as const, addon: name, error });
      }
    }

    return await call(
      read,
      {
        id: context.system.address,
      },
      { context }
    );
  });
