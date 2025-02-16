import { z } from 'zod';

export const PauseFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  paused: z.boolean(),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type PauseFormType = z.infer<typeof PauseFormSchema>;

export const PauseOutputSchema = z.string();
export type PauseOutputType = z.infer<typeof PauseOutputSchema>;
