import { z } from 'zod';

export const CreateFundFormSchema = z.object({
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
  isin: z.string().optional(),
  fundClass: z.string().min(1, { message: 'Fund class is required' }),
  fundCategory: z.string().min(1, { message: 'Fund category is required' }),
  managementFeeBps: z.number().min(0, { message: 'Management fee must be at least 0' }),
});

export type CreateFundFormType = z.infer<typeof CreateFundFormSchema>;

export const CreateFundOutputSchema = z.string();
export type CreateFundOutputType = z.infer<typeof CreateFundOutputSchema>;
