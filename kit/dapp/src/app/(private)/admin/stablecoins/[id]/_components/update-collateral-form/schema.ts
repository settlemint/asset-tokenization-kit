import { z } from 'zod';

export const UpdateCollateralFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  amount: z.number().min(1, { message: 'Amount is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type UpdateCollateralFormType = z.infer<typeof UpdateCollateralFormSchema>;

export const UpdateCollateralOutputSchema = z.string();
export type UpdateCollateralOutputType = z.infer<typeof UpdateCollateralOutputSchema>;
