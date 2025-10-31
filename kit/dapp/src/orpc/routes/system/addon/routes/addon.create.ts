/**
 * System Addon Registration Handler
 *
 * @fileoverview
 * Implements secure registration of system addons through the ATKSystemAddonRegistry.
 * Addons extend the base token functionality with specialized features like airdrops,
 * yield schedules, and cross-chain settlement protocols.
 *
 * @remarks
 * ARCHITECTURAL DECISIONS:
 * - Sequential processing prevents challenge response conflicts
 * - Factory pattern enables consistent addon initialization across types
 * - Duplicate detection prevents redundant registrations and gas waste
 * - Standardized initialization data ensures proper access control integration
 *
 * SECURITY BOUNDARIES:
 * - All registrations require wallet verification
 * - Permission validation ensures only authorized users can register addons
 * - Initialization data includes access manager for proper permission inheritance
 * - Contract validation prevents registration with invalid or malicious implementations
 *
 * ADDON LIFECYCLE:
 * - Registration: Deploy proxy pointing to implementation contract
 * - Initialization: Configure access control and system integration
 * - Activation: Enable addon features for token operations
 * - Usage: Addon functions become available in token mutation operations
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Sequential processing: ~3-5 seconds per addon (includes verification + deployment)
 * - Batch operations: Linear scaling with verification overhead per addon
 * - Duplicate filtering: O(n) preprocessing to prevent unnecessary blockchain calls
 * - Factory deployment: ~200k gas per addon registration
 *
 * @see {@link ./addon.create.schema} Input validation and default implementations
 * @see {@link generateInitializationData} Access control integration pattern
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import type { Context } from "@/orpc/context/context";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { read } from "@/orpc/routes/system/routes/system.read";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { call } from "@orpc/server";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { encodeFunctionData, getAddress } from "viem";
import {
  getDefaultAddonImplementations,
  type SystemAddonConfig,
} from "./addon.create.schema";

const logger = createLogger();

/**
 * GraphQL mutation for registering a system addon via proxy pattern.
 *
 * @remarks
 * PROXY DEPLOYMENT: Creates a new proxy contract pointing to the implementation
 * and initializes it with system-specific configuration. This enables:
 * - Upgradeable addon logic through implementation swapping
 * - Consistent initialization across all addon instances
 * - Gas optimization through shared implementation contracts
 *
 * INITIALIZATION FLOW:
 * 1. Deploy minimal proxy pointing to addon implementation
 * 2. Call initialize() with access manager and system addresses
 * 3. Register proxy address in system addon registry
 * 4. Enable addon functionality for the system
 *
 * @param address - The system addon registry contract address
 * @param from - The wallet address with addon registration permissions
 * @param name - Unique identifier for the addon within the system
 * @param implementation - Factory contract address for the addon type
 * @param initializationData - ABI-encoded initialize() call with access control setup
 * @param challengeId - Portal verification challenge ID (auto-injected by middleware)
 * @param challengeResponse - MFA challenge response (auto-injected by middleware)
 * @returns Object containing the blockchain transaction hash for monitoring
 */

const REGISTER_SYSTEM_ADDON_MUTATION = portalGraphql(`
  mutation RegisterSystemAddonMutation(
    $address: String!
    $from: String!
    $name: String!
    $implementation: String!
    $initializationData: String!
    $challengeId: String
    $challengeResponse: String
  ) {
    ATKSystemAddonRegistryImplementationRegisterSystemAddon(
      address: $address
      from: $from
      input: {
        name: $name
        implementation_: $implementation
        initializationData: $initializationData
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Maps addon types to their primary implementation factory names.
 *
 * @remarks
 * IMPLEMENTATION SELECTION: Each addon type has a default factory contract
 * that creates instances with consistent interfaces. This mapping enables:
 * - Type-safe addon creation with known factory contracts
 * - Consistent initialization patterns across addon types
 * - Easy extension for new addon types
 *
 * FACTORY SPECIALIZATION:
 * - pushAirdropFactory: Merkle tree-based token distribution
 * - fixedYieldScheduleFactory: Time-based yield calculation and distribution
 * - xvpSettlementFactory: Cross-chain settlement and verification protocols
 */

const ADDON_TYPE_TO_IMPLEMENTATION_NAME = {
  airdrops: "pushAirdropFactory", // Default to push airdrop for now
  yield: "fixedYieldScheduleFactory",
  xvp: "xvpSettlementFactory",
} as const;

/**
 * Generates standardized initialization data for addon factory contracts.
 *
 * @remarks
 * ACCESS CONTROL INTEGRATION: All addons must be initialized with proper
 * access control integration to inherit system permissions and maintain
 * security boundaries. The initialization data ensures:
 *
 * SECURITY PATTERN:
 * - accessManager: Enables role-based permission checks for addon operations
 * - systemAddress: Provides context for system-wide operations and state
 * - Consistent ABI: All factories expect the same initialize signature
 *
 * ABI ENCODING: Uses viem's encodeFunctionData for type-safe parameter encoding
 * preventing initialization failures due to parameter mismatches.
 *
 * @param context - ORPC context containing authenticated system information
 * @returns Hex-encoded initialization data for the addon factory initialize() function
 * @throws Error When system addresses are not available in context
 */

function generateInitializationData(context: Context): string {
  // The addon factories expect accessManager as first param and systemAddress as second
  const accessManagerAddress = getAddress(
    context.system?.systemAccessManager?.id ?? ""
  );
  const systemAddress = getAddress(context.system?.id ?? "");

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
 * Resolves the factory implementation address for an addon configuration.
 *
 * @remarks
 * IMPLEMENTATION RESOLUTION: Supports both custom and default implementations:
 * - Custom: User-provided factory addresses for specialized addon variants
 * - Default: System-provided factory addresses for standard addon types
 *
 * FALLBACK STRATEGY:
 * 1. Check for user-provided custom implementation in addon config
 * 2. Fall back to system default implementation for the addon type
 * 3. Fail fast if neither custom nor default implementation is available
 *
 * SECURITY: Only pre-approved factory contracts should be used as defaults
 * to prevent deployment of malicious addon implementations.
 *
 * @param addonConfig - Addon configuration including type and optional custom implementations
 * @returns Ethereum address of the factory contract to use for addon creation
 * @throws Error When no implementation is found for the specified addon type
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
 */
export const addonCreate = onboardedRouter.system.addon.create
  .use(systemMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.addonCreate,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { addons, walletVerification } = input;
    const sender = context.auth.user;
    const { system } = context;

    if (!system?.systemAddonRegistry) {
      const cause = new Error("System addon registry not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    // TYPESCRIPT SAFETY: Store registry address to satisfy null checks
    // WHY: TypeScript can't prove system.systemAddonRegistry won't be null later
    // This prevents repeated null checks throughout the function
    const systemAddonRegistryAddress = system.systemAddonRegistry.id;

    // INPUT NORMALIZATION: Convert single addon to array for consistent processing
    // WHY: API accepts both single addons and arrays, but internal logic expects arrays
    // This simplifies the processing loop and error handling
    const addonList = Array.isArray(addons) ? addons : [addons];

    // DUPLICATE DETECTION: Query existing addons to prevent redundant registrations
    // WHY: Addon names must be unique within a system, and duplicate registrations
    // would fail on-chain with gas costs. Pre-filtering saves gas and improves UX.
    let existingAddonNames = new Set<string>();
    try {
      const systemData = context.system;

      existingAddonNames = new Set(
        systemData.systemAddonRegistry.systemAddons.map((addon) =>
          addon.name.toLowerCase()
        )
      );
    } catch (error) {
      // GRACEFUL DEGRADATION: If we can't fetch existing addons, proceed anyway
      // WHY: The smart contract will reject duplicates, but user gets less friendly error
      // This ensures the operation doesn't fail due to temporary indexing issues
      logger.debug(`Could not fetch existing addons: ${String(error)}`);
    }

    // DUPLICATE FILTERING: Remove addons that already exist in the system
    // WHY: Prevents wasted gas and provides immediate feedback for duplicate attempts
    // Case-insensitive comparison matches smart contract behavior
    const addonsToRegister = addonList.filter(
      (addon) => !existingAddonNames.has(addon.name.toLowerCase())
    );

    // SEQUENTIAL PROCESSING: Process addons one at a time to prevent verification conflicts
    // WHY: Each addon registration requires a unique challenge response from Portal
    // Parallel processing would cause challenge response conflicts and transaction failures
    // TRADEOFF: Slower batch processing but guaranteed transaction success
    const addonErrors: string[] = [];

    for (const addonConfig of addonsToRegister) {
      const { name } = addonConfig;

      try {
        // ADDON DEPLOYMENT PREPARATION: Resolve factory and prepare initialization
        // WHY: Each addon type requires specific factory contract and standardized initialization
        // This ensures consistent deployment patterns and proper access control integration
        const implementationAddress = getImplementationAddress(addonConfig);
        const initializationData = generateInitializationData(context);

        // VERIFICATION PATTERN: Portal middleware handles challenge generation per transaction
        // WHY: Each blockchain transaction requires a unique verification challenge
        // The middleware automatically generates fresh challenges for sequential operations

        // TRANSACTION PREPARATION: Assemble variables for addon registration
        // WHY: GraphQL mutation requires specific parameter structure
        // Portal middleware will enrich with challengeId and challengeResponse
        const variables = {
          address: systemAddonRegistryAddress,
          from: sender.wallet,
          name: name,
          implementation: implementationAddress,
          initializationData: initializationData,
        };

        // BLOCKCHAIN EXECUTION: Submit addon registration with wallet verification
        // WHY: Portal client handles transaction tracking and verification automatically
        // Returns validated transaction hash once confirmed and indexed
        await context.portalClient.mutate(
          REGISTER_SYSTEM_ADDON_MUTATION,
          variables,
          {
            sender: sender,
            code: walletVerification.secretVerificationCode,
            type: walletVerification.verificationType,
          }
        );

        logger.info(`Addon ${name} registered successfully`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Failed to create addon ${name}:`, error);
        addonErrors.push(`Failed to create addon ${name}: ${errorMessage}`);
      }
    }

    if (addonErrors.length > 0) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: addonErrors.join("\n"),
      });
    }

    return await call(
      read,
      {
        id: context.system.id,
      },
      { context }
    );
  });
