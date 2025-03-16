import { type ZodInfer, z } from '@/lib/utils/zod';

export const TransferFundSchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  decimals: z.decimals(),
});

export type TransferFundInput = ZodInfer<typeof TransferFundSchema>;
