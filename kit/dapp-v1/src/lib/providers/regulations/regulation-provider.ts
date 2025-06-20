/**
 * Regulation Providers
 *
 * This module provides a simple API for working with regulations.
 * Internally, it routes operations to the appropriate type-specific provider.
 */

import {
  RegulationType,
  type NewRegulationConfig,
  type RegulationConfig,
} from "@/lib/db/regulations/schema-base-regulation-configs";

// Import provider factory
import { createRegulationProvider } from "./regulation-factory";

/**
 * Creates a new regulation with type-specific configuration
 *
 * @param baseConfig The base regulation configuration
 * @param specificConfig Type-specific configuration (optional)
 * @returns The ID of the created regulation
 */
export async function createRegulation(
  baseConfig: Omit<NewRegulationConfig, "id">,
  specificConfig?: unknown
): Promise<string> {
  // Get the appropriate provider based on regulation type
  const provider = createRegulationProvider(
    baseConfig.regulationType as RegulationType
  );

  // Use the provider to create the regulation
  return await provider.create(baseConfig, specificConfig);
}

/**
 * Updates an existing regulation
 *
 * @param id The ID of the regulation
 * @param baseConfig Base configuration updates
 * @param regulationType Type of the regulation being updated
 * @param specificConfig Type-specific configuration updates (optional)
 */
export async function updateRegulation(
  id: string,
  baseConfig: Partial<Omit<NewRegulationConfig, "id">>,
  regulationType: RegulationType,
  specificConfig?: unknown
): Promise<void> {
  // Get the appropriate provider
  const provider = createRegulationProvider(regulationType);

  // Use the provider to update the regulation
  await provider.update(id, baseConfig, specificConfig);
}

/**
 * Retrieves a regulation by ID
 *
 * @param id The ID of the regulation
 * @param regulationType Type of the regulation to retrieve
 * @returns The regulation with its type-specific details
 */
export async function getRegulationById(
  id: string,
  regulationType: RegulationType
): Promise<{
  baseConfig: RegulationConfig;
  specificConfig?: unknown;
} | null> {
  // Get the appropriate provider
  const provider = createRegulationProvider(regulationType);

  // Use the provider to get the regulation
  return await provider.getById(id);
}

/**
 * Retrieves all regulations for a specific asset
 *
 * @param assetId The ID of the asset
 * @param regulationType Optional filter by regulation type
 * @returns Array of regulations with their type-specific details
 */
export async function getRegulationsByAssetId(
  assetId: string,
  regulationType?: RegulationType
): Promise<
  {
    baseConfig: RegulationConfig;
    specificConfig?: unknown;
  }[]
> {
  // If no regulationType is provided, we'll get all regulations
  // and handle them by their individual types
  if (!regulationType) {
    // First fetch all base configs for the asset to determine their types
    // This would typically be done by querying the base regulation_configs table
    // Here we're assuming an external function to fetch this basic info

    // For now, let's assume we have a central provider that can fetch all
    // base regulations regardless of type
    const baseProvider = createRegulationProvider(RegulationType.MICA);
    return await baseProvider.getByAssetId(assetId);
  }

  // If a specific type is requested, use the appropriate provider
  const provider = createRegulationProvider(regulationType);
  return await provider.getByAssetId(assetId);
}
