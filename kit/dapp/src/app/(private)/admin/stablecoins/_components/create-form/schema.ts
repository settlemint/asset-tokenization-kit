import { z } from 'zod';

export const CollateralProofValidityDuration = {
  OneHour: 'One hour',
  OneDay: 'One day',
  OneWeek: 'One week',
  OneMonth: 'One month',
  OneYear: 'One year',
} as const;

export const CreateStablecoinFormSchema = z.object({
  assetName: z.string().min(1, { message: 'Name is required' }),
  symbol: z.string().min(1, { message: 'Symbol is required' }),
  decimals: z
    .number()
    .min(0, { message: 'Decimals must be at least 0' })
    .max(18, { message: 'Decimals must be between 0 and 18' })
    .default(18),
  private: z.boolean().default(false),
  pincode: z
    .string()
    .length(6, { message: 'PIN code must be exactly 6 digits' })
    .regex(/^\d+$/, 'PIN code must contain only numbers'),
  isin: z.string().length(12, { message: 'ISIN must be exact 12 characters' }).optional(),
  collateralThreshold: z
    .number()
    .min(0, { message: 'Collateral threshold must be at least 0' })
    .max(100, { message: 'Collateral threshold must be between 0 and 100 %' })
    .default(100),
  collateralProofValidityDuration: z
    .enum(Object.keys(CollateralProofValidityDuration) as [keyof typeof CollateralProofValidityDuration])
    .default('OneYear'),
});

export type CreateStablecoinFormType = z.infer<typeof CreateStablecoinFormSchema>;

export const CreateStablecoinOutputSchema = z.string();
export type CreateStablecoinOutputType = z.infer<typeof CreateStablecoinOutputSchema>;
