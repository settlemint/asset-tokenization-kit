import { z } from 'zod';

export const PauseFundFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type PauseFundFormType = z.infer<typeof PauseFundFormSchema>;

export const PauseFundOutputSchema = z.string();
export type PauseFundOutputType = z.infer<typeof PauseFundOutputSchema>;
