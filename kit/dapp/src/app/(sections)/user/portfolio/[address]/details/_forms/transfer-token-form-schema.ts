import { isAddress } from 'viem';
import { z } from 'zod';

export const TransferTokenSchema = z.object({
  to: z.string(),
  amount: z.coerce.number(),
  tokenAddress: z
    .string()
    .refine((address) => isAddress(address), { message: 'Please enter a valid Ethereum address' }),
});

export type TransferTokenSchemaType = z.infer<typeof TransferTokenSchema>;

export const transferTokenDefaultValues: TransferTokenSchemaType = {
  to: '',
  amount: 0,
  tokenAddress: '0x',
} as const;

export type TransferTokenFormStepFields = keyof typeof transferTokenDefaultValues;

export const transferTokenFormStepFields: TransferTokenFormStepFields[] = Object.keys(
  transferTokenDefaultValues
) as TransferTokenFormStepFields[];
