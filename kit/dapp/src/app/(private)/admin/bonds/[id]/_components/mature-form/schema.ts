import { z } from 'zod';

export const MatureFormSchema = z.object({
  address: z.string().min(1, { message: 'Bond address is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type MatureFormType = z.infer<typeof MatureFormSchema>;

export const MatureOutputSchema = z.string();
export type MatureOutputType = z.infer<typeof MatureOutputSchema>;
