import { BigNumber } from 'bignumber.js';
import { z } from 'zod';

export const getMintFormSchema = (collateralAvailable?: number) =>
  z.object({
    address: z.string().min(1, { message: 'Address is required' }),
    to: z.string().min(1, { message: 'Recipient is required' }),
    amount: collateralAvailable
      ? z
          .string()
          .min(1, { message: 'Amount is required' })
          .refine(
            (val) => {
              const amount = BigNumber(val);
              return amount.gt(0) && amount.lte(collateralAvailable);
            },
            (val) => {
              const amount = BigNumber(val);
              return {
                message: amount.eq(0) ? 'Amount must be greater than 0' : 'Amount cannot be greater than collateral',
              };
            }
          )
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

export type MintFormType = z.infer<ReturnType<typeof getMintFormSchema>>;

export const MintOutputSchema = z.string();
export type MintOutputType = z.infer<typeof MintOutputSchema>;
