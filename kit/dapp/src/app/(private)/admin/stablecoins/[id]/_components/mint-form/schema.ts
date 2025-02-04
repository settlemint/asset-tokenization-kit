import { z } from 'zod';

export const MintStablecoinFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  to: z.string().min(1, { message: 'Recipient is required' }),
  amount: z.number().min(1, { message: 'Amount is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type MintStablecoinFormType = z.infer<typeof MintStablecoinFormSchema>;

export const MintStablecoinOutputSchema = z.string();
export type MintStablecoinOutputType = z.infer<typeof MintStablecoinOutputSchema>;
