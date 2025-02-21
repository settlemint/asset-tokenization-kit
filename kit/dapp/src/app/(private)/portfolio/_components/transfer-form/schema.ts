import { assetConfig } from '@/lib/config/assets';
import { BigNumber } from 'bignumber.js';
import { z } from 'zod';

const PIN_CODE_REGEX = /^\d+$/;

// Get all asset query keys from the config as a tuple with at least one element
const assetTypes = Object.values(assetConfig).map((asset) => asset.queryKey) as [string, ...string[]];

export const getTransferFormSchema = (balance?: string) => {
  return z.object({
    address: z.string().min(1, { message: 'Address is required' }),
    to: z.string().min(1, { message: 'Recipient is required' }),
    value: balance
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
    assetType: z.enum(assetTypes),
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
