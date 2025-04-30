/**
 * MICA Regulation Provider
 *
 * Implements the regulation provider for MICA-specific regulations.
 * This extends the base regulation provider with MICA-specific functionality.
 */

import { db } from "@/lib/db";
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
    specificConfig: Omit<NewMicaRegulationConfig, "id" | "regulationConfigId">
  ): Promise<void> {
    const micaId = randomUUID();

    const micaConfigToInsert = {
      id: micaId,
      regulationConfigId,
      ...specificConfig,
    };

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
    specificConfig: Partial<
      Omit<NewMicaRegulationConfig, "id" | "regulationConfigId">
    >
  ): Promise<void> {
    // First check if the MICA config exists
    const existingMicaConfig = await tx
      .select({ configId: micaRegulationConfigs.id })
      .from(micaRegulationConfigs)
      .where(eq(micaRegulationConfigs.regulationConfigId, regulationConfigId))
      .execute();

    if (existingMicaConfig.length === 0) {
      throw new Error(
        "MICA config not found for regulation config ID: " + regulationConfigId
      );
    }

    await tx
      .update(micaRegulationConfigs)
      .set(specificConfig)
      .where(eq(micaRegulationConfigs.regulationConfigId, regulationConfigId));
  }

  /**
   * Get MICA-specific configuration
   *
   * @param regulationConfigId ID of the regulation
   * @returns MICA-specific configuration if exists
   */
  protected async getTypeSpecificConfig(
    regulationConfigId: string
  ): Promise<MicaRegulationConfig | undefined> {
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
