/**
 * Token Address Prediction Handler Map
 *
 * @remarks
 * This module implements the handler pattern for asset-type-specific address prediction
 * using CREATE2 deterministic deployment. It provides a polymorphic interface that
 * routes prediction requests to the appropriate handler based on asset type.
 *
 * ARCHITECTURAL PATTERN:
 * - Handler pattern for asset-type-specific prediction logic
 * - Type-safe mapping using TypeScript's Record type
 * - Shared context interface for consistent handler signatures
 * - Polymorphic dispatch based on asset type enumeration
 *
 * BUSINESS CONTEXT:
 * - Different asset types have different factory contracts and parameters
 * - Each asset type requires specific GraphQL queries for Portal integration
 * - Address prediction enables UI previews before actual deployment
 * - CREATE2 ensures predicted addresses match deployed addresses
 *
 * DESIGN DECISIONS:
 * - Record type ensures all asset types have handlers (compile-time safety)
 * - Shared context prevents parameter duplication across handlers
 * - Async handlers support Portal GraphQL queries
 * - Type discrimination happens at the handler level for flexibility
 *
 * @see {@link PredictHandlerContext} Shared context for all prediction handlers
 * @see {@link AssetType} Asset type enumeration for type discrimination
 * @see {@link ValidatedPortalClient} Portal client for CREATE2 calculations
 */

import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import type {
  PredictAddressInput,
  PredictAddressOutput,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import type { AssetType } from "@atk/zod/asset-types";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { bondPredictHandler } from "./bond.predict";
import { depositPredictHandler } from "./deposit.predict";
import { equityPredictHandler } from "./equity.predict";
import { fundPredictHandler } from "./fund.predict";
import { stablecoinPredictHandler } from "./stablecoin.predict";

/**
 * Shared context interface for all address prediction handlers.
 *
 * @remarks
 * CONTEXT DESIGN: This interface provides the common dependencies that all
 * prediction handlers need to perform CREATE2 address calculations via Portal.
 *
 * FACTORY ADDRESS: Each prediction is scoped to a specific factory contract
 * address, ensuring predictions are accurate for the intended deployment context.
 * Different environments (dev, staging, prod) may have different factory addresses.
 *
 * PORTAL CLIENT: The validated Portal client provides type-safe GraphQL operations
 * with automatic response validation and error handling. This ensures consistent
 * behavior across all prediction handlers.
 *
 * IMMUTABILITY: The context is read-only to prevent handlers from modifying
 * shared state and causing side effects that could affect other predictions.
 */
export interface PredictHandlerContext {
  /** Factory contract address for CREATE2 prediction scoping */
  factoryAddress: EthereumAddress;
  /** Validated Portal client for type-safe GraphQL operations */
  portalClient: ValidatedPortalClient;
}

/**
 * Type-safe mapping of asset types to their corresponding prediction handlers.
 *
 * @remarks
 * HANDLER PATTERN: This map implements the handler pattern by providing a
 * polymorphic interface for address prediction. Each asset type has its own
 * handler that understands the specific parameters and GraphQL queries needed.
 *
 * TYPE SAFETY: The Record type ensures that all asset types defined in the
 * AssetType union have corresponding handlers. This provides compile-time
 * safety and prevents runtime errors from missing handlers.
 *
 * CONSISTENT INTERFACE: All handlers share the same function signature,
 * enabling polymorphic dispatch while allowing asset-specific implementation
 * details to be encapsulated within each handler.
 *
 * EXTENSIBILITY: Adding new asset types requires adding both the type to the
 * AssetType union and a corresponding handler to this map. The TypeScript
 * compiler will enforce this requirement.
 *
 * @example
 * ```typescript
 * // Polymorphic handler dispatch
 * const handler = predictAddressHandlerMap[assetType];
 * const prediction = await handler(input, context);
 *
 * // Type-safe access with specific asset types
 * const fundHandler = predictAddressHandlerMap[AssetTypeEnum.fund];
 * const bondHandler = predictAddressHandlerMap[AssetTypeEnum.bond];
 *
 * // Compile-time error if handler is missing
 * // const missingHandler = predictAddressHandlerMap["nonexistent"]; // TypeScript error
 * ```
 */
export const predictAddressHandlerMap: Record<
  AssetType,
  (
    input: PredictAddressInput,
    context: PredictHandlerContext
  ) => Promise<PredictAddressOutput>
> = {
  // DEPOSIT TOKENS: Bank deposits and restricted access instruments
  [AssetTypeEnum.deposit]: depositPredictHandler,

  // BOND TOKENS: Fixed-income debt instruments with yield functionality
  [AssetTypeEnum.bond]: bondPredictHandler,

  // EQUITY TOKENS: Ownership shares in companies or assets
  [AssetTypeEnum.equity]: equityPredictHandler,

  // FUND TOKENS: Investment portfolios with underlying asset composition
  [AssetTypeEnum.fund]: fundPredictHandler,

  // STABLECOIN TOKENS: Price-stable cryptocurrencies with potential MICA compliance
  [AssetTypeEnum.stablecoin]: stablecoinPredictHandler,
};
