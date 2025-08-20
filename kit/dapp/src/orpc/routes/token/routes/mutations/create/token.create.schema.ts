/**
 * Unified Token Creation Schema
 *
 * This schema provides a single interface for creating different types of tokens
 * (deposit, bond, etc.) with conditional validation based on the asset type.
 * It uses Zod's discriminated union pattern to ensure type-safe validation
 * where certain fields are only required for specific token types.
 *
 * @example
 * ```typescript
 * // Create a deposit token
 * const depositInput = {
 *   type: "deposit",
 *   name: "USD Deposit Token",
 *   symbol: "USDD",
 *   decimals: 2,
 *   verification: { code: "123456", type: "pincode" }
 * };
 *
 * // Create a bond token
 * const bondInput = {
 *   type: "bond",
 *   name: "Corporate Bond Token",
 *   symbol: "CORP",
 *   decimals: 2,
 *   cap: "1000000",
 *   faceValue: "1000",
 *   maturityDate: "2025-12-31",
 *   denominationAsset: "0x...",
 *   verification: { code: "123456", type: "pincode" }
 * };
 * ```
 */

import { BondTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/bond.create.schema";
import { DepositTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/deposit.create.schema";
import { EquityTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/equity.create.schema";
import { FundTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/fund.create.schema";
import { StablecoinTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/stablecoin.create.schema";
import { assetTypeArray } from "@atk/zod/asset-types";
import { z } from "zod";

/**
 * Main unified token creation schema using discriminated union
 * This pattern ensures type-safe conditional validation where:
 * - Common fields are always required
 * - Type-specific fields are only required when the corresponding type is selected
 */
export const TokenCreateSchema = z.discriminatedUnion("type", [
  DepositTokenSchema,
  BondTokenSchema,
  EquityTokenSchema,
  FundTokenSchema,
  StablecoinTokenSchema,
]);

/**
 * Output schema for streaming events during token creation
 * Used by both deposit and bond token creation flows
 */
export const TokenCreateOutputSchema = z.object({
  status: z.enum(["pending", "confirmed", "failed"]),
  message: z.string(),
  transactionHash: z.string().optional(),
  result: z.string().optional(), // For compatibility with useStreamingMutation hook
  tokenType: assetTypeArray().optional(),
});

// Type exports using Zod's type inference
export type TokenCreateInput = z.infer<typeof TokenCreateSchema>;
export type TokenCreateOutput = z.infer<typeof TokenCreateOutputSchema>;
