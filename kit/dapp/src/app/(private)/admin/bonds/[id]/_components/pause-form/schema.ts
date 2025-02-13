import { z } from 'zod';

export const PauseBondFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type PauseBondFormType = z.infer<typeof PauseBondFormSchema>;

export const PauseBondOutputSchema = z.string();
export type PauseBondOutputType = z.infer<typeof PauseBondOutputSchema>;
