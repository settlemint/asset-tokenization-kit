import { z } from 'zod';

export const FreezeFundFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
  account: z.string().min(1, 'Account address is required'),
});

export type FreezeFundFormType = z.infer<typeof FreezeFundFormSchema>;

export const FreezeFundOutputSchema = z.string();
export type FreezeFundOutputType = z.infer<typeof FreezeFundOutputSchema>;
