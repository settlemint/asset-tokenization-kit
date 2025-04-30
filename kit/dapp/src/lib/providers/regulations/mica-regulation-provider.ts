/**
 * MICA Regulation Provider
 *
 * Implements the regulation provider for MICA-specific regulations.
 * This extends the base regulation provider with MICA-specific functionality.
 */

import { db } from "@/lib/db";
import type { RegulationConfig } from "@/lib/db/regulations/schema-base-regulation-configs";
import {
  micaRegulationConfigs,
  type MicaRegulationConfig,
  type NewMicaRegulationConfig,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { BaseRegulationProvider } from "./base-regulation-provider";

/**
 * Provider for MICA regulation operations
 */
export class MicaRegulationProvider extends BaseRegulationProvider {
  /**
   * Create MICA-specific configuration
   *
   * @param tx Transaction object
   * @param regulationConfigId ID of the regulation
   * @param specificConfig MICA-specific configuration
   */
  protected async createTypeSpecificConfig(
    tx: any,
    regulationConfigId: string,
    specificConfig: unknown
  ): Promise<void> {
    const micaConfig = specificConfig as Omit<
      NewMicaRegulationConfig,
      "id" | "regulationConfigId"
    >;
    const micaId = randomUUID();

    // Create a new object with id and regulationConfigId explicitly to avoid property overwriting
    const micaConfigToInsert = {
      id: micaId,
      regulationConfigId,
    };

    // Add remaining properties from micaConfig
    Object.entries(micaConfig).forEach(([key, value]) => {
      if (key !== "id" && key !== "regulationConfigId") {
        // @ts-ignore - Dynamic property assignment
        micaConfigToInsert[key] = value;
      }
    });

    await tx
      .insert(micaRegulationConfigs)
      .values(micaConfigToInsert as NewMicaRegulationConfig);
  }

  /**
   * Update MICA-specific configuration
   *
   * @param tx Transaction object
   * @param regulationConfigId ID of the regulation
   * @param specificConfig MICA-specific configuration updates
   */
  protected async updateTypeSpecificConfig(
    tx: any,
    regulationConfigId: string,
    specificConfig: unknown
  ): Promise<void> {
    const micaConfig = specificConfig as Partial<
      Omit<NewMicaRegulationConfig, "id" | "regulationConfigId">
    >;

    // First check if the MICA config exists
    const existingMicaConfig = await tx
      .select({ configId: micaRegulationConfigs.id })
      .from(micaRegulationConfigs)
      .where(eq(micaRegulationConfigs.regulationConfigId, regulationConfigId))
      .execute();

    if (existingMicaConfig.length > 0) {
      // Update existing MICA config
      await tx
        .update(micaRegulationConfigs)
        .set(micaConfig)
        .where(
          eq(micaRegulationConfigs.regulationConfigId, regulationConfigId)
        );
    } else {
      // Insert new MICA config
      const micaId = randomUUID();

      // We need to create a complete MICA config for insertion
      // This would typically require additional data, so this should be handled
      // at a higher level by requiring a complete config to be passed in
      if (
        !(
          "documents" in micaConfig ||
          "reserveComposition" in micaConfig ||
          "tokenType" in micaConfig
        )
      ) {
        throw new Error(
          "Cannot create a new MICA config with partial data. A complete config is required."
        );
      }

      // Create a new object with id and regulationConfigId explicitly to avoid property overwriting
      const completeConfig = {
        id: micaId,
        regulationConfigId,
      };

      // Add remaining properties from micaConfig
      Object.entries(micaConfig).forEach(([key, value]) => {
        if (key !== "id" && key !== "regulationConfigId") {
          // @ts-ignore - Dynamic property assignment
          completeConfig[key] = value;
        }
      });

      await tx
        .insert(micaRegulationConfigs)
        .values(completeConfig as NewMicaRegulationConfig);
    }
  }

  /**
   * Get MICA-specific configuration
   *
   * @param regulationConfigId ID of the regulation
   * @param baseConfig Base regulation config
   * @returns MICA-specific configuration if exists
   */
  protected async getTypeSpecificConfig(
    regulationConfigId: string,
    baseConfig: RegulationConfig
  ): Promise<MicaRegulationConfig | undefined> {
    // Only fetch MICA config if the regulation type is MICA
    if (baseConfig.regulationType !== "mica") {
      return undefined;
    }

    const micaResult = await db
      .select()
      .from(micaRegulationConfigs)
      .where(eq(micaRegulationConfigs.regulationConfigId, regulationConfigId))
      .execute();

    if (micaResult.length > 0) {
      return micaResult[0];
    }

    return undefined;
  }
}
