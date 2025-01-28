import { z } from 'zod';

export const CreateCryptoCurrencyFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  symbol: z.string().min(1, { message: 'Symbol is required' }),
  decimals: z
    .number()
    .min(0, { message: 'Decimals is required' })
    .max(18, { message: 'Decimals must be between 0 and 18' })
    .default(18),
  private: z.boolean().optional(),
  pincode: z.string().length(6).regex(/^\d+$/, 'PIN code must contain only numbers'),
  initialSupply: z.number().optional().default(0),
});
export type CreateCryptoCurrencyFormType = z.infer<typeof CreateCryptoCurrencyFormSchema>;

export const CreateCryptoCurrencyOutputSchema = z.string();
export type CreateCryptoCurrencyOutputType = z.infer<typeof CreateCryptoCurrencyOutputSchema>;
