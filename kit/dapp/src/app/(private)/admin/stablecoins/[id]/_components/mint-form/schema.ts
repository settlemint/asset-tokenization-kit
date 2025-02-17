import { z } from 'zod';

export const MintFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  to: z.string().min(1, { message: 'Recipient is required' }),
  amount: z.number().min(1, { message: 'Amount is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
  decimals: z
    .number()
    .min(0, { message: 'Decimals must be at least 0' })
    .max(18, { message: 'Decimals must be between 0 and 18' })
    .default(18),
});

export type MintFormType = z.infer<typeof MintFormSchema>;

export const MintOutputSchema = z.string();
export type MintOutputType = z.infer<typeof MintOutputSchema>;
