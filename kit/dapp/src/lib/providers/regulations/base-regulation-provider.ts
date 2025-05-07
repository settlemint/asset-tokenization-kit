/**
 * Base Regulation Provider
 *
 * Defines the common interface and base implementation for all regulation types.
 * Specific regulation type providers will extend this class.
 */

import { db } from "@/lib/db";
import {
  regulationConfigs,
  type NewRegulationConfig,
  type RegulationConfig,
} from "@/lib/db/regulations/schema-base-regulation-configs";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

/**
 * Base class for regulation providers
 */
export abstract class BaseRegulationProvider {
  /**
   * Create a new regulation
   *
   * @param baseConfig Base configuration for the regulation
   * @param specificConfig Type-specific configuration (optional)
   * @returns The ID of the created regulation
   */
  async create(
    baseConfig: Omit<NewRegulationConfig, "id">,
    specificConfig?: unknown
  ): Promise<string> {
    const id = randomUUID();

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert base regulation config
      await tx.insert(regulationConfigs).values({
        id,
        ...baseConfig,
      });

      // Handle type-specific config in derived classes
      if (specificConfig) {
        await this.createTypeSpecificConfig(tx, id, specificConfig);
      }

      return id;
    });
  }

  /**
   * Update an existing regulation
   *
   * @param id The ID of the regulation to update
   * @param baseConfig The base regulation configuration updates
   * @param specificConfig Type-specific configuration updates (optional)
   */
  async update(
    id: string,
    baseConfig: Partial<Omit<NewRegulationConfig, "id">>,
    specificConfig?: unknown
  ): Promise<void> {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Update base regulation config if there are changes
      if (Object.keys(baseConfig).length > 0) {
        await tx
          .update(regulationConfigs)
          .set({
            ...baseConfig,
            updatedAt: new Date(),
          })
          .where(eq(regulationConfigs.id, id));
      }

      // Handle type-specific config in derived classes
      if (specificConfig) {
        await this.updateTypeSpecificConfig(tx, id, specificConfig);
      }
    });
  }

  /**
   * Get a regulation by ID
   *
   * @param id The ID of the regulation to retrieve
   * @returns The regulation with optional type-specific details
   */
  async getById(id: string): Promise<{
    baseConfig: RegulationConfig;
    specificConfig?: unknown;
  } | null> {
    // Get base regulation config
    const baseConfig = await db
      .select()
      .from(regulationConfigs)
      .where(eq(regulationConfigs.id, id))
      .execute();

    if (baseConfig.length === 0) {
      return null;
    }

    // Get type-specific config from derived classes
    const specificConfig = await this.getTypeSpecificConfig(id, baseConfig[0]);

    return {
      baseConfig: baseConfig[0],
      specificConfig,
    };
  }

  /**
   * Get all regulations for a specific asset
   *
   * @param assetId The ID of the asset
   * @returns Array of regulations with optional type-specific details
   */
  async getByAssetId(assetId: string): Promise<
    {
      baseConfig: RegulationConfig;
      specificConfig?: unknown;
    }[]
  > {
    // Get all base regulation configs for the asset
    const baseConfigs = await db
      .select()
      .from(regulationConfigs)
      .where(eq(regulationConfigs.assetId, assetId))
      .execute();

    if (baseConfigs.length === 0) {
      return [];
    }

    // For each baseConfig, get its type-specific config
    return await Promise.all(
          baseConfigs.map(async (baseConfig) => {
            const specificConfig = await this.getTypeSpecificConfig(
              baseConfig.id,
              baseConfig
            );
            return {
              baseConfig,
              specificConfig,
            };
          })
        );

  }

  /**
   * Create type-specific configuration
   * To be implemented by derived classes
   */
  protected abstract createTypeSpecificConfig(
    tx: any,
    regulationConfigId: string,
    specificConfig: unknown
  ): Promise<void>;

  /**
   * Update type-specific configuration
   * To be implemented by derived classes
   */
  protected abstract updateTypeSpecificConfig(
    tx: any,
    regulationConfigId: string,
    specificConfig: unknown
  ): Promise<void>;

  /**
   * Get type-specific configuration
   * To be implemented by derived classes
   */
  protected abstract getTypeSpecificConfig(
    regulationConfigId: string,
    baseConfig: RegulationConfig
  ): Promise<unknown | undefined>;
}
