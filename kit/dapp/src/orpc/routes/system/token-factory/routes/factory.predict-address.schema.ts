/**
 * Factory Predict Address Schema
 *
 * This schema provides a unified interface for predicting addresses of different token types
 * before they are deployed. It reuses the token creation schemas but excludes verification
 * requirements since no transaction is being executed.
 *
 * @example
 * ```typescript
 * // Predict deposit token address
 * const depositInput = {
 *   type: "deposit",
 *   name: "USD Deposit Token",
 *   symbol: "USDD",
 *   decimals: 2,
 *   initialModulePairs: []
 * };
 *
 * // Predict bond token address
 * const bondInput = {
 *   type: "bond",
 *   name: "Corporate Bond Token",
 *   symbol: "CORP",
 *   decimals: 2,
 *   cap: "1000000",
 *   faceValue: "1000",
 *   maturityDate: "2025-12-31",
 *   denominationAsset: "0x...",
 *   initialModulePairs: []
 * };
 * ```
 */

import { BondTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/bond.create.schema";
import { DepositTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/deposit.create.schema";
import { EquityTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/equity.create.schema";
import { FundTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/fund.create.schema";
import { StablecoinTokenSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/stablecoin.create.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Predict address input schema - reuses token creation schemas but removes verification field
 * Uses discriminated union pattern for type-safe validation
 */
export const PredictAddressInputSchema = z.discriminatedUnion("type", [
  DepositTokenSchema.omit({ walletVerification: true }),
  BondTokenSchema.omit({ walletVerification: true }),
  EquityTokenSchema.omit({ walletVerification: true }),
  FundTokenSchema.omit({ walletVerification: true }),
  StablecoinTokenSchema.omit({ walletVerification: true }),
]);

/**
 * Output schema for address prediction
 */
export const PredictAddressOutputSchema = z.object({
  predictedAddress: ethereumAddress.describe(
    "The predicted address of the token"
  ),
});

// Type exports using Zod's type inference
export type PredictAddressInput = z.infer<typeof PredictAddressInputSchema>;
export type PredictAddressOutput = z.infer<typeof PredictAddressOutputSchema>;
