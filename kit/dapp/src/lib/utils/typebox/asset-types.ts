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
  "tokenizeddeposit",
] as const;

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
