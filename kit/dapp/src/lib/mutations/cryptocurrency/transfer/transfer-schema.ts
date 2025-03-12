import { type ZodInfer, z } from "@/lib/utils/zod";

export const TransferCryptocurrencySchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  assetType: z.literal("cryptocurrency"),
  decimals: z.decimals(),
});

export type TransferCryptocurrencyInput = ZodInfer<typeof TransferCryptocurrencySchema>;
