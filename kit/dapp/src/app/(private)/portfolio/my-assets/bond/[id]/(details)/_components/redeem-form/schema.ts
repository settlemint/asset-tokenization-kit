import { z } from 'zod';

const PIN_CODE_REGEX = /^\d+$/;

export const getRedeemFormSchema = (amountLimit?: number) =>
  z.object({
    address: z.string().min(1, { message: 'Address is required' }),
    amount: amountLimit ? z.number().min(1).max(amountLimit) : z.number().min(1),
    pincode: z
      .string()
      .length(6, { message: 'PIN code must be exactly 6 digits' })
      .regex(PIN_CODE_REGEX, 'PIN code must contain only numbers'),
    decimals: z
      .number()
      .min(0, { message: 'Decimals must be at least 0' })
      .max(18, { message: 'Decimals must be between 0 and 18' })
      .default(18),
  });

export type RedeemFormType = z.infer<ReturnType<typeof getRedeemFormSchema>>;

export const RedeemOutputSchema = z.string();
export type RedeemOutputType = z.infer<typeof RedeemOutputSchema>;
