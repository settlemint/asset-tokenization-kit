/**
 * Regulation Provider Factory
 *
 * Factory pattern to create the appropriate regulation provider based on regulation type.
 */

import { RegulationType } from "@/lib/db/regulations/schema-base-regulation-configs";
import { BaseRegulationProvider } from "./base-regulation-provider";
import { MicaRegulationProvider } from "./mica-regulation-provider";

// Provider cache to store instances by regulation type
const providerCache = new Map<RegulationType, BaseRegulationProvider>();

/**
 * Create a regulation provider for the specified regulation type
 * Reuses existing provider instances when available
 *
 * @param regulationType Type of regulation
 * @returns Appropriate regulation provider for the type
 */
export function createRegulationProvider(
  regulationType: RegulationType
): BaseRegulationProvider {
  // Check if we already have a provider instance for this type
  const cachedProvider = providerCache.get(regulationType);
  if (cachedProvider) {
    return cachedProvider;
  }

  // Create a new provider instance if none exists
  let provider: BaseRegulationProvider;

  switch (regulationType) {
    case RegulationType.MICA:
      provider = new MicaRegulationProvider();
      break;
    // Add cases for other regulation types as they are implemented
    default:
      throw new Error(
        `No provider implemented for regulation type: ${regulationType}`
      );
  }

  // Cache the new provider instance
  providerCache.set(regulationType, provider);

  return provider;
}
