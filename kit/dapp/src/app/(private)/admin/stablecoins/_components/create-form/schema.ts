import { z } from 'zod';

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
  isin: z.string(),
  collateralThreshold: z
    .number()
    .min(0, { message: 'Collateral threshold must be at least 0' })
    .max(100, { message: 'Collateral threshold must be between 0 and 100 %' })
    .default(100),
  collateralProofValidityDuration: z
    .number()
    .min(3600, { message: 'Collateral Proof Validity duration must be at least 3600 seconds' })
    .default(30 * 24 * 60 * 60),
});

export type CreateStablecoinFormType = z.infer<typeof CreateStablecoinFormSchema>;

export const CreateStablecoinOutputSchema = z.string();
export type CreateStablecoinOutputType = z.infer<typeof CreateStablecoinOutputSchema>;
