/**
 * TypeBox validators for asset types
 *
 * This module provides TypeBox schemas for validating asset types,
 * ensuring they match predefined enumerations.
 */
import type { SchemaOptions, StaticDecode } from "@sinclair/typebox";
import { t } from "elysia/type-system";

/**
 * Enum of valid asset types
 */
export const assetTypes = [
  "bond",
  "cryptocurrency",
  "equity",
  "fund",
  "stablecoin",
  "deposit",
] as const;

/**
 * Enum-like object for dot notation access to asset types
 * Example: AssetTypeEnum.stablecoin instead of "stablecoin"
 */
export const AssetTypeEnum = Object.fromEntries(
  assetTypes.map((type) => [type, type])
) as Record<AssetType, AssetType>;

/**
 * Validates an asset type
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates asset types
 */
export const AssetType = (options?: SchemaOptions) =>
  t.UnionEnum(assetTypes, {
    ...options,
  });

export type AssetType = StaticDecode<ReturnType<typeof AssetType>>;
