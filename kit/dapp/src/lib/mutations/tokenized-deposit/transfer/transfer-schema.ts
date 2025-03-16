import { type ZodInfer, z } from '@/lib/utils/zod';

export const TransferTokenizedDepositSchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  decimals: z.decimals(),
});

export type TransferTokenizedDepositSchema = ZodInfer<
  typeof TransferTokenizedDepositSchema
>;

export type TransferTokenizedDepositInput = ZodInfer<
  typeof TransferTokenizedDepositSchema
>;
