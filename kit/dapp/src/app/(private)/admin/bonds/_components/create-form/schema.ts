import { z } from 'zod';

export const PaymentFrequency = {
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
  SemiAnnually: 'Semi-annually',
  Annually: 'Annually',
} as const;

export const CreateBondFormSchema = z.object({
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
  faceValueCurrency: z.string().min(1, { message: 'Face value currency is required' }),
  faceValue: z.number().min(1, { message: 'Face value is required' }),
  maturityDate: z.date(),
  couponRate: z.number().int().min(0, { message: 'Coupon rate must be at least 0' }),
  paymentFrequency: z.enum([
    PaymentFrequency.Monthly,
    PaymentFrequency.Quarterly,
    PaymentFrequency.SemiAnnually,
    PaymentFrequency.Annually,
  ]),
  firstCouponDate: z.date(),
  cap: z.number(),
});

export type CreateBondFormType = z.infer<typeof CreateBondFormSchema>;

export const CreateBondOutputSchema = z.string();
export type CreateBondOutputType = z.infer<typeof CreateBondOutputSchema>;
