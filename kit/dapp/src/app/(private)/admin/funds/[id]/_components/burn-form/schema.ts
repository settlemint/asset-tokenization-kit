import { z } from 'zod';

export const BurnFundFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
  amount: z.number().min(1, { message: 'Amount is required' }),
});

export type BurnFundFormType = z.infer<typeof BurnFundFormSchema>;

export const BurnFundOutputSchema = z.string();
export type BurnFundOutputType = z.infer<typeof BurnFundOutputSchema>;
