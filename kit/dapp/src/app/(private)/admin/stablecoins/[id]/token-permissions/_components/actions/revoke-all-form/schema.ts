import { z } from 'zod';

export const RevokeAllFormSchema = z.object({
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'PIN code must contain only numbers' }),
  address: z.string().min(1, { message: 'Address is required' }),
  userAddress: z.string().min(1, { message: 'User is required' }),
  currentRoles: z.array(z.string()),
});

export type RevokeAllFormType = z.infer<typeof RevokeAllFormSchema>;

export const RevokeAllOutputSchema = z.array(z.string());
export type RevokeAllOutputType = z.infer<typeof RevokeAllOutputSchema>;
