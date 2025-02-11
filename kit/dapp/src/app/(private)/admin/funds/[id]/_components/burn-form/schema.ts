import { z } from 'zod';

export const BurnFundFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  from: z.string().min(1, { message: 'Sender address is required' }),
  challengeResponse: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
  input: z.object({
    amount: z.number().min(1, { message: 'Amount is required' }),
  }),
  // Optional fields
  gasLimit: z.string().optional(),
  gasPrice: z.string().optional(),
  metadata: z.any().optional(), // Consider using a more specific type for JSON
  simulate: z.boolean().optional(),
  value: z.string().optional(),
});

export type BurnFundFormType = z.infer<typeof BurnFundFormSchema>;

export const BurnFundOutputSchema = z.string();
export type BurnFundOutputType = z.infer<typeof BurnFundOutputSchema>;
