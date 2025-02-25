import { z } from 'zod';

export const TopUpFormSchema = z.object({
  address: z.string().min(1, { message: 'Bond address is required' }),
  amount: z.number().min(1, { message: 'Amount is required' }),
  decimals: z.number().min(1, { message: 'Decimals are required' }),
  underlyingAssetAddress: z.string().min(1, { message: 'Underlying asset address is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type TopUpFormType = z.infer<typeof TopUpFormSchema>;

export const TopUpOutputSchema = z.string();
export type TopUpOutputType = z.infer<typeof TopUpOutputSchema>;
