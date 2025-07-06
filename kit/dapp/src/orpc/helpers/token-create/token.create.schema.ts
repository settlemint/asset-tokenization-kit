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
 *   underlyingAsset: "0x...",
 *   verification: { code: "123456", type: "pincode" }
 * };
 * ```
 */

import { getAssetTypeCapitalized } from "@/lib/utils/asset-capitalization";
import {
  assetTypeArray,
  AssetTypeEnum,
  type AssetType,
} from "@/lib/zod/validators/asset-types";
import { decimals } from "@/lib/zod/validators/decimals";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { isin } from "@/lib/zod/validators/isin";
import { CreateSchema } from "@/orpc/routes/common/schemas/create.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { z } from "zod/v4";

/**
 * Creates a messages schema for token creation based on the asset type
 * This reduces duplication by dynamically generating messages with the appropriate asset type name
 *
 * @param assetType - The type of asset being created (e.g., "deposit", "bond")
 * @returns A Zod schema with messages tailored to the specific asset type
 */
export function createTokenMessagesSchema(assetType: AssetType) {
  return TransactionTrackingMessagesSchema.extend({
    // Generic token creation messages
    creatingToken: z
      .string()
      .optional()
      .default(`Creating the ${assetType}...`),
    tokenCreated: z
      .string()
      .optional()
      .default(`${getAssetTypeCapitalized(assetType)} successfully created.`),
    tokenCreationFailed: z
      .string()
      .optional()
      .default(`Failed to create the ${assetType}.`),

    // Messages used by useStreamingMutation hook
    initialLoading: z
      .string()
      .optional()
      .default(`Preparing to create ${assetType}...`),
    noResultError: z
      .string()
      .optional()
      .default(`No transaction hash received from ${assetType} creation.`),
    defaultError: z
      .string()
      .optional()
      .default(`Failed to create the ${assetType}.`),
  });
}

// TODO: fix
// export function createTokenSchema(assetType: AssetType) {
//   return TokenBaseSchema.extend({
//     type: z.literal(assetType),
//     messages: createTokenMessagesSchema(assetType).optional(),
//   });
// }

/**
 * Base fields common to all token types
 */
const TokenBaseSchema = CreateSchema.extend({
  name: z.string().describe("The name of the token"),
  symbol: z.string().describe("The symbol of the token"),
  decimals: decimals(),
  isin: isin().optional(),
});

/**
 * Deposit token specific schema
 */
const DepositTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.deposit),
  messages: createTokenMessagesSchema(AssetTypeEnum.deposit).optional(),
});

/**
 * Bond token specific schema with additional required fields
 */
const BondTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.bond),
  messages: createTokenMessagesSchema(AssetTypeEnum.bond).optional(),
  cap: z.string().describe("The cap of the bond"),
  faceValue: z.string().describe("The face value of the bond"),
  maturityDate: z.string().describe("The maturity date of the bond"),
  underlyingAsset: ethereumAddress.describe("The underlying asset of the bond"),
});

/**
 * Main unified token creation schema using discriminated union
 * This pattern ensures type-safe conditional validation where:
 * - Common fields are always required
 * - Type-specific fields are only required when the corresponding type is selected
 */
export const TokenCreateSchema = z.discriminatedUnion("type", [
  DepositTokenSchema,
  BondTokenSchema,
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

// TODO: cleanup
// const x: TokenCreateInput = {} as unknown as TokenCreateInput;
// if (x.type === AssetTypeEnum.bond) {
//   console.log(x.faceValue);
// } else if (x.type === AssetTypeEnum.deposit) {
//   console.log(x.type);
// }
