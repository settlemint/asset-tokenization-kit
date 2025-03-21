import { type ZodInfer, z } from '@/lib/utils/zod';

export const TopUpSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
  target: z.enum(["bond", "yield"]),
});

export type TopUpInput = ZodInfer<typeof TopUpSchema>;
