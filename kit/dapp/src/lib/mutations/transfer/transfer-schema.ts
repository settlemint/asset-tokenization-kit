import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating transfer mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} to - The recipient address
 * @property {number} value - The amount to transfer
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset
 */
export const TransferSchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  assettype: z.assetType(),
});

export type TransferInput = ZodInfer<typeof TransferSchema>;
