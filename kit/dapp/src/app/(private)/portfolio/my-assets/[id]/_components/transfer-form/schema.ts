import { z } from 'zod';

export const TransferFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  to: z.string().min(1, { message: 'Recipient is required' }),
  value: z.number().min(1, { message: 'Value is required' }),
  assetType: z.enum(['stablecoin', 'fund', 'equity', 'cryptocurrency', 'bond']),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type TransferFormType = z.infer<typeof TransferFormSchema>;
export type TransferFormAssetType = z.infer<typeof TransferFormSchema>['assetType'];

export const TransferOutputSchema = z.string();
export type TransferOutputType = z.infer<typeof TransferOutputSchema>;
