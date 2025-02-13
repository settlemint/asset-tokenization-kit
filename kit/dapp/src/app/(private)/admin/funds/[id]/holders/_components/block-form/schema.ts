import { z } from 'zod';

export const BlockHolderFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type BlockHolderFormType = z.infer<typeof BlockHolderFormSchema>;

export const BlockHolderOutputSchema = z.string();
export type BlockHolderOutputType = z.infer<typeof BlockHolderOutputSchema>;
