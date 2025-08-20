import { fiatCurrency } from "@atk/zod/fiat-currency";
import { z } from "zod";

/**
 * Schema for updating BASE_CURRENCY setting.
 * Must be a valid fiat currency code.
 */
const baseCurrencySchema = z.object({
  key: z.literal("BASE_CURRENCY"),
  value: fiatCurrency(),
});

/**
 * Schema for updating SYSTEM_ADDRESS setting.
 * Must be a valid Ethereum address or empty string.
 */
const systemAddressSchema = z.object({
  key: z.literal("SYSTEM_ADDRESS"),
  value: z
    .string()
    .refine(
      (value) => value === "" || /^0x[a-fA-F0-9]{40}$/.test(value),
      "SYSTEM_ADDRESS must be a valid Ethereum address (0x...) or empty string"
    ),
});

/**
 * Schema for updating SYSTEM_ADDONS_SKIPPED setting.
 * Must be "true" or "false" string.
 */
const systemAddonsSkippedSchema = z.object({
  key: z.literal("SYSTEM_ADDONS_SKIPPED"),
  value: z.enum(["true", "false"]),
});

/**
 * Schema for updating an existing setting.
 *
 * Validates the setting key and new value before update.
 * Each setting type has specific validation rules.
 */
export const SettingsUpsertSchema = z.discriminatedUnion("key", [
  baseCurrencySchema,
  systemAddressSchema,
  systemAddonsSkippedSchema,
]);

/**
 * Type representing the validated input for settings upsert operation.
 */
export type SettingsUpsertInput = z.infer<typeof SettingsUpsertSchema>;
