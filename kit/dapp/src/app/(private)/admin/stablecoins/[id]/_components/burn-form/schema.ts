import { z } from 'zod';

export const BurnStablecoinFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  amount: z.number().min(1, { message: 'Amount is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type BurnStablecoinFormType = z.infer<typeof BurnStablecoinFormSchema>;

export const BurnStablecoinOutputSchema = z.string();
export type BurnStablecoinOutputType = z.infer<typeof BurnStablecoinOutputSchema>;
