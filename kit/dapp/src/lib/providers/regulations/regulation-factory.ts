/**
 * Regulation Provider Factory
 *
 * Factory pattern to create the appropriate regulation provider based on regulation type.
 */

import { RegulationType } from "@/lib/db/regulations/schema-base-regulation-configs";
import { BaseRegulationProvider } from "./base-regulation-provider";
import { MicaRegulationProvider } from "./mica-regulation-provider";

/**
 * Create a regulation provider for the specified regulation type
 *
 * @param regulationType Type of regulation
 * @returns Appropriate regulation provider for the type
 */
export function createRegulationProvider(
  regulationType: RegulationType
): BaseRegulationProvider {
  switch (regulationType) {
    case RegulationType.MICA:
      return new MicaRegulationProvider();
    // Add cases for other regulation types as they are implemented
    default:
      throw new Error(
        `No provider implemented for regulation type: ${regulationType}`
      );
  }
}
