import { type ZodInfer, z } from '@/lib/utils/zod';

export const TransferEquitySchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  decimals: z.decimals(),
});

export type TransferEquityInput = ZodInfer<typeof TransferEquitySchema>;
