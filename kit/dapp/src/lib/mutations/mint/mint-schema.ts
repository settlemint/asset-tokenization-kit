import { type ZodInfer, z } from "@/lib/utils/zod";

/**
 * Zod schema for validating generic mint mutation inputs
 *
 * @property {string} address - The contract address
 * @property {number} amount - The amount of tokens to mint
 * @property {string} to - The recipient address
 * @property {string} pincode - User's pincode for authentication
 * @property {string} assetType - The type of asset
 */
export const MintSchema = (max?: number) =>
  z.object({
    address: z.address(),
    amount: z.amount(max),
    to: z.address(),
    pincode: z.pincode(),
    assettype: z.assetType(),
  });

export type MintInput = ZodInfer<ReturnType<typeof MintSchema>>;
