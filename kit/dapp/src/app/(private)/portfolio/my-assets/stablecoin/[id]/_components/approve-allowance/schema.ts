import { z } from 'zod';
const PIN_CODE_REGEX = /^\d+$/;
export const getApproveFormSchema = (amountLimit?: number) =>
  z.object({
    address: z.string().min(1, { message: 'Address is required' }),
    to: z.string().min(1, { message: 'Recipient is required' }),
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

export type ApproveFormType = z.infer<ReturnType<typeof getApproveFormSchema>>;

export const ApproveOutputSchema = z.string();
export type ApproveOutputType = z.infer<typeof ApproveOutputSchema>;
