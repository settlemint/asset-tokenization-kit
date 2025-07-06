/**
 * Token Creation Strategy Interface
 *
 * This interface defines the contract for token-type-specific operations in the
 * token creation process. It follows the Strategy Pattern to encapsulate the
 * varying behaviors (GraphQL mutations, variable construction, validation)
 * while allowing the Template Method to handle the common algorithm flow.
 *
 * Each token type (deposit, bond, etc.) implements this interface to provide
 * its specific mutation, variable building, and validation logic.
 */

import type { SessionUser } from "@/lib/auth";
import type { AssetType } from "@/lib/zod/validators/asset-types";
import type { ChallengeResponse } from "@/orpc/helpers/challenge-response";
import type { TokenCreateInput } from "@/orpc/helpers/token.create.schema";
import type { TokenFactory } from "@/orpc/middlewares/system/system.middleware";
import type { VariablesOf } from "gql.tada";

/**
 * Context object passed to strategy methods containing common dependencies
 */
export interface TokenCreationContext {
  /** The authenticated user initiating the transaction */
  user: SessionUser;
  /** Token factory contract information */
  tokenFactory: TokenFactory;
  /** Challenge response for MFA verification */
  challengeResponse: ChallengeResponse;
}

/**
 * Strategy interface for token creation operations
 *
 * This interface encapsulates the token-type-specific logic that varies
 * between different asset types (deposit, bond, equity, etc.).
 */
export interface TokenCreationStrategy<
  TType extends AssetType = AssetType,
  TadaDocumentNode = never,
> {
  /**
   * Get the asset type this strategy handles
   * @returns The asset type string (e.g., "deposit", "bond")
   */
  getAssetType(): TType;

  getMutation(): TadaDocumentNode;

  getVariables(
    input: Extract<TokenCreateInput, { type: TType }>,
    context: TokenCreationContext
  ): VariablesOf<TadaDocumentNode>;
}

/**
 * Registry of available token creation strategies
 * This will be populated by concrete strategy implementations
 */
export const tokenCreationStrategies = new Map<
  AssetType,
  () => TokenCreationStrategy
>();

/**
 * Register a strategy for a specific asset type
 * @param assetType - The asset type this strategy handles
 * @param strategyFactory - Factory function that creates the strategy instance
 */
export function registerTokenCreationStrategy(
  assetType: AssetType,
  strategyFactory: () => TokenCreationStrategy
): void {
  tokenCreationStrategies.set(assetType, strategyFactory);
}

/**
 * Get a strategy instance for the specified asset type
 * @param assetType - The asset type to get a strategy for
 * @returns The strategy instance
 * @throws {Error} If no strategy is registered for the asset type
 */
export function getTokenCreationStrategy(
  assetType: AssetType
): TokenCreationStrategy {
  const strategyFactory = tokenCreationStrategies.get(assetType);

  if (!strategyFactory) {
    throw new Error(
      `No token creation strategy registered for asset type: ${assetType}`
    );
  }

  return strategyFactory();
}

/**
 * Check if a strategy is available for the specified asset type
 * @param assetType - The asset type to check
 * @returns True if a strategy is available, false otherwise
 */
export function hasTokenCreationStrategy(assetType: AssetType): boolean {
  return tokenCreationStrategies.has(assetType);
}

/**
 * Get all registered asset types that have strategies
 * @returns Array of asset types with registered strategies
 */
export function getAvailableAssetTypes(): AssetType[] {
  return Array.from(tokenCreationStrategies.keys());
}
