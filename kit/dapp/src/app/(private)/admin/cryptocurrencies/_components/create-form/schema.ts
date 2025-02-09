import { z } from 'zod';

export const CreateCryptoCurrencyFormSchema = z.object({
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
  initialSupply: z.string().min(0, { message: 'Initial supply must be at least 0' }).default('0'),
});

export type CreateCryptoCurrencyFormType = z.infer<typeof CreateCryptoCurrencyFormSchema>;

export const CreateCryptoCurrencyOutputSchema = z.string();
export type CreateCryptoCurrencyOutputType = z.infer<typeof CreateCryptoCurrencyOutputSchema>;
