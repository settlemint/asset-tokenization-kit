import { z } from 'zod';

export const MintEquityFormSchema = z.object({
  recipient: z.string().min(1, { message: 'Recipient is required' }),
  amount: z.number().min(1, { message: 'Amount is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type MintEquityFormType = z.infer<typeof MintEquityFormSchema>;

export const MintEquityOutputSchema = z.string();
export type MintEquityOutputType = z.infer<typeof MintEquityOutputSchema>;
