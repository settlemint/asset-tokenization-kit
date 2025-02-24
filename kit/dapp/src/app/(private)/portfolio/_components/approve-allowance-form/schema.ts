import { assetConfig } from '@/lib/config/assets';
import type { NonEmptyArray } from '@/lib/non-empty-array.type';
import { isAddress, zeroAddress } from 'viem';
import { z } from 'zod';
const PIN_CODE_REGEX = /^\d+$/;

const assetKeys = Object.keys(assetConfig) as NonEmptyArray<keyof typeof assetConfig>;

export const getApproveFormSchema = (amountLimit?: number) =>
  z.object({
    address: z.string().min(1, { message: 'Address is required' }),
    to: z
      .string()
      .min(1, { message: 'Recipient is required' })
      .refine((val) => isAddress(val), {
        message: 'Invalid recipient address',
      })
      .refine((val) => val !== zeroAddress, {
        message: 'Recipient cannot be the zero address',
      }),
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
    assetType: z.enum(assetKeys),
  });

export type ApproveFormType = z.infer<ReturnType<typeof getApproveFormSchema>>;

export const ApproveOutputSchema = z.string();
export type ApproveOutputType = z.infer<typeof ApproveOutputSchema>;

export type ApproveFormAssetType = z.infer<ReturnType<typeof getApproveFormSchema>>['assetType'];
