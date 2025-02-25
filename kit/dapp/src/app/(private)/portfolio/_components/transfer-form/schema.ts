import { assetConfig } from '@/lib/config/assets';
import type { NonEmptyArray } from '@/lib/non-empty-array.type';
import { z } from 'zod';

const PIN_CODE_REGEX = /^\d+$/;

const assetKeys = Object.keys(assetConfig) as NonEmptyArray<keyof typeof assetConfig>;
export const getTransferFormSchema = (balance?: string) => {
  return z.object({
    address: z.string().min(1, { message: 'Address is required' }),
    to: z.string().min(1, { message: 'Recipient is required' }),
    value: balance
      ? z
          .number()
          .min(1, { message: 'Amount is required' })
          .max(Number(balance), { message: `Amount cannot be greater than balance ${balance}` })
      : z.number().min(1, { message: 'Amount is required' }),
    assetType: z.enum(assetKeys),
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
};

export type TransferFormSchema = ReturnType<typeof getTransferFormSchema>;
export type TransferFormType = z.infer<TransferFormSchema>;
export type TransferFormAssetType = z.infer<TransferFormSchema>['assetType'];

export const TransferOutputSchema = z.string();
export type TransferOutputType = z.infer<typeof TransferOutputSchema>;
