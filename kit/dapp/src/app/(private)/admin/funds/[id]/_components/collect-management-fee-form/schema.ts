import { z } from 'zod';

export const CollectManagementFeeSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type CollectManagementFeeType = z.infer<typeof CollectManagementFeeSchema>;

export const CollectManagementFeeOutputSchema = z.string();
export type CollectManagementFeeOutputType = z.infer<typeof CollectManagementFeeOutputSchema>;
