import { z } from 'zod';

export const PauseStablecoinFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type PauseStablecoinFormType = z.infer<typeof PauseStablecoinFormSchema>;

export const PauseStablecoinOutputSchema = z.string();
export type PauseStablecoinOutputType = z.infer<typeof PauseStablecoinOutputSchema>;
