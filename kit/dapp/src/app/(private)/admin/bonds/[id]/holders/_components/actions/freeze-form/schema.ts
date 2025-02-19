import { z } from 'zod';

export const FreezeFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  userAddress: z.string().min(1, { message: 'User is required' }),
  amount: z.number().min(1, { message: 'Amount is required' }),
  decimals: z
    .number()
    .min(0, { message: 'Decimals must be at least 0' })
    .max(18, { message: 'Decimals must be between 0 and 18' })
    .default(18),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type FreezeFormType = z.infer<typeof FreezeFormSchema>;

export const FreezeOutputSchema = z.string();
export type FreezeOutputType = z.infer<typeof FreezeOutputSchema>;
