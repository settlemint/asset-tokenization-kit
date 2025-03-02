import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * Zod schema for validating freeze account mutation inputs
 *
 * @property {string} address - The fund contract address
 * @property {string} userAddress - The address of the user to freeze
 * @property {number} amount - The amount to freeze
 * @property {string} pincode - The pincode for signing the transaction
 */
export const FreezeSchema = z.object({
  address: z.address(),
  userAddress: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
});

export type FreezeInput = ZodInfer<typeof FreezeSchema>;
