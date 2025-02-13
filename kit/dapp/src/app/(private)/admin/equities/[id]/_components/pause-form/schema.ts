import { z } from 'zod';

export const PauseEquityFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type PauseEquityFormType = z.infer<typeof PauseEquityFormSchema>;

export const PauseEquityOutputSchema = z.string();
export type PauseEquityOutputType = z.infer<typeof PauseEquityOutputSchema>;
