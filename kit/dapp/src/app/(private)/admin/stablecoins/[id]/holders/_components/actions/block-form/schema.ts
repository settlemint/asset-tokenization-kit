import { z } from 'zod';

export const BlockUserFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  blocked: z.boolean(),
  userAddress: z.string().min(1, { message: 'User is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type BlockUserFormType = z.infer<typeof BlockUserFormSchema>;

export const BlockUserOutputSchema = z.string();
export type BlockUserOutputType = z.infer<typeof BlockUserOutputSchema>;
