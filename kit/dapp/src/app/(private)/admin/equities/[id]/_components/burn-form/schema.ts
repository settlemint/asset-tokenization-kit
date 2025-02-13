import { z } from 'zod';

export const BurnEquityFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
  amount: z.number().min(1, { message: 'Amount is required' }),
  from: z.string().min(1, { message: 'Recipient is required' }),
});

export type BurnEquityFormType = z.infer<typeof BurnEquityFormSchema>;

export const BurnEquityOutputSchema = z.string();
export type BurnEquityOutputType = z.infer<typeof BurnEquityOutputSchema>;
