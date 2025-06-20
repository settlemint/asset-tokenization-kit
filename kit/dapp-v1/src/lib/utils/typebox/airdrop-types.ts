/**
 * TypeBox validators for airdrop types
 *
 * This module provides TypeBox schemas for validating airdrop types,
 * ensuring they match predefined enumerations.
 */
import type { SchemaOptions, StaticDecode } from "@sinclair/typebox";
import { t } from "elysia/type-system";

/**
 * Enum of valid airdrop types
 */
export const airdropTypes = ["standard", "vesting", "push"] as const;

/**
 * Enum-like object for dot notation access to airdrop types
 * Example: AirdropTypeEnum.standard instead of "standard"
 */
export const AirdropTypeEnum = Object.fromEntries(
  airdropTypes.map((type) => [type, type])
) as Record<AirdropType, AirdropType>;

/**
 * Validates an airdrop type
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates airdrop types
 */
export const AirdropType = (options?: SchemaOptions) =>
  t.UnionEnum(airdropTypes, {
    ...options,
  });

export type AirdropType = StaticDecode<ReturnType<typeof AirdropType>>;
