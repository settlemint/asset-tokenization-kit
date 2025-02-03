import { z } from 'zod';

export const CollateralProofValidityDuration = {
  OneHour: 'One hour',
  OneDay: 'One day',
  OneWeek: 'One week',
  OneMonth: 'One month',
  OneYear: 'One year',
} as const;

export const CreateStablecoinFormSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  amount: z.number().min(1, { message: 'Amount is required' }),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
});

export type CreateStablecoinFormType = z.infer<typeof CreateStablecoinFormSchema>;

export const CreateStablecoinOutputSchema = z.string();
export type CreateStablecoinOutputType = z.infer<typeof CreateStablecoinOutputSchema>;
