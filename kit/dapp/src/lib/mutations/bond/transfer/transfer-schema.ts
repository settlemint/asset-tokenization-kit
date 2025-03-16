import { type ZodInfer, z } from '@/lib/utils/zod';

export const TransferBondSchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  decimals: z.decimals(),
});

export type TransferBondInput = ZodInfer<typeof TransferBondSchema>;
