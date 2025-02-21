import { assetAmountSchema } from '@/lib/schema/assets/amount';
import { assetDecimalsSchema } from '@/lib/schema/assets/decimals';
import { pinCodeSchema } from '@/lib/schema/pincode';
import { z } from 'zod';

export const getApproveFormSchema = (amountLimit?: bigint) =>
  z.object({
    address: z.string().min(1, { message: 'Address is required' }),
    to: z.string().min(1, { message: 'Recipient is required' }),
    amount: assetAmountSchema(amountLimit),
    pincode: pinCodeSchema,
    decimals: assetDecimalsSchema,
  });

export type ApproveFormType = z.infer<ReturnType<typeof getApproveFormSchema>>;

export const ApproveOutputSchema = z.string();
export type ApproveOutputType = z.infer<typeof ApproveOutputSchema>;
