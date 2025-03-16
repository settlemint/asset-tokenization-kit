import { type ZodInfer, z } from '@/lib/utils/zod';

export const MatureFormSchema = z.object({
  address: z.address(),
  pincode: z.pincode(),
});

export type MatureFormInput = ZodInfer<typeof MatureFormSchema>;
