import { z } from 'zod';

export const CreateCryptoCurrencyFormSchema = z.object({
  tokenName: z.string().min(1, { message: 'Token name is required' }),
  tokenSymbol: z.string().min(1, { message: 'Token symbol is required' }),
  decimals: z.number(),
  private: z.boolean().optional(),
  pincode: z.string().length(6).regex(/^\d+$/, 'PIN code must contain only numbers'),
  initialSupply: z.string(),
});
export type CreateCryptoCurrencyFormType = z.infer<typeof CreateCryptoCurrencyFormSchema>;

export const CreateCryptoCurrencyOutputSchema = z.string();
export type CreateCryptoCurrencyOutputType = z.infer<typeof CreateCryptoCurrencyOutputSchema>;
