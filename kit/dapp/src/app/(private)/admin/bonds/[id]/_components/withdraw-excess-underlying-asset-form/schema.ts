import { z } from 'zod';

export const WithdrawFormSchema = z.object({
  address: z.string().min(1, { message: 'Bond address is required' }),
  to: z.string().min(1, { message: 'Recipient address is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type WithdrawFormType = z.infer<typeof WithdrawFormSchema>;

export const WithdrawOutputSchema = z.string();
export type WithdrawOutputType = z.infer<typeof WithdrawOutputSchema>;
