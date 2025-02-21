import { BigNumber } from 'bignumber.js';
import { z } from 'zod';

export const getBurnFormSchema = (balance?: string) =>
  z.object({
    address: z.string().min(1, { message: 'Address is required' }),
    amount: balance
      ? z
          .string()
          .min(1, { message: 'Amount is required' })
          .refine((val) => BigNumber(val).gt(0), {
            message: 'Amount must be greater than 0',
          })
          .refine((val) => BigNumber(val).lte(balance), {
            message: 'Amount cannot be greater than balance',
          })
      : z.string().min(1, { message: 'Amount is required' }),
    pincode: z
      .string()
      .length(6, { message: 'PIN code must be exactly 6 digits' })
      .regex(/^\d+$/, 'PIN code must contain only numbers'),
    decimals: z
      .number()
      .min(0, { message: 'Decimals must be at least 0' })
      .max(18, { message: 'Decimals must be between 0 and 18' })
      .default(18),
  });

export type BurnFormType = z.infer<ReturnType<typeof getBurnFormSchema>>;

export const BurnOutputSchema = z.string();
export type BurnOutputType = z.infer<typeof BurnOutputSchema>;
