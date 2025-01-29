import { z } from 'zod';

export const CreateEquityFormSchema = z.object({
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
  equityClass: z.string().min(1, { message: 'Equity class is required' }),
  equityCategory: z.string().min(1, { message: 'Equity category is required' }),
});

export type CreateEquityFormType = z.infer<typeof CreateEquityFormSchema>;

export const CreateEquityOutputSchema = z.string();
export type CreateEquityOutputType = z.infer<typeof CreateEquityOutputSchema>;
