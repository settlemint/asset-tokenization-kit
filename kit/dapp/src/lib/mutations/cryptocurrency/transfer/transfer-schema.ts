import { type ZodInfer, z } from "@/lib/utils/zod";

export const TransferCryptoCurrencySchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  assetType: z.literal("cryptocurrency"),
  decimals: z.decimals(),
});

export type TransferCryptoCurrencySchema = ZodInfer<
  typeof TransferCryptoCurrencySchema
>;
