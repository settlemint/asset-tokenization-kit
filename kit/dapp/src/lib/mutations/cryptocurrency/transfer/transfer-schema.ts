import { type ZodInfer, z } from '@/lib/utils/zod';

export const TransferCryptoCurrencySchema = z.object({
  address: z.address(),
  decimals: z.decimals(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  assetType: z.literal('cryptocurrency'),
});

export type TransferCryptoCurrencyInput = ZodInfer<
  typeof TransferCryptoCurrencySchema
>;
