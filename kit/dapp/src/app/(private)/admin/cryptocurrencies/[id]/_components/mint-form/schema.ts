import { z } from 'zod';

export const MintFundFormSchema = z.object({
  recipient: z.string().min(1, { message: 'Recipient is required' }),
  amount: z.number().min(1, { message: 'Amount is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type MintFundFormType = z.infer<typeof MintFundFormSchema>;

export const MintFundOutputSchema = z.string();
export type MintFundOutputType = z.infer<typeof MintFundOutputSchema>;
