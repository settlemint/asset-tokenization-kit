import { isAddress } from 'viem';
import { z } from 'zod';

export const StakeTokenSchema = z.object({
  baseAmount: z.coerce.number(),
  quoteAmount: z.coerce.number(),
  tokenAddress: z
    .string()
    .refine((address) => isAddress(address), { message: 'Please enter a valid Ethereum address' }),
  baseTokenAddress: z
    .string()
    .refine((address) => isAddress(address), { message: 'Please enter a valid Ethereum address' }),
  quoteTokenAddress: z
    .string()
    .refine((address) => isAddress(address), { message: 'Please enter a valid Ethereum address' }),
});

export type StakeTokenSchemaType = z.infer<typeof StakeTokenSchema>;

export const stakeTokenDefaultValues: StakeTokenSchemaType = {
  baseAmount: 0,
  quoteAmount: 0,
  tokenAddress: '0x',
  baseTokenAddress: '0x',
  quoteTokenAddress: '0x',
} as const;

export type StakeTokenFormPageFields = keyof typeof stakeTokenDefaultValues;

export const stakeTokenFormPageFields: StakeTokenFormPageFields[] = Object.keys(
  stakeTokenDefaultValues
) as StakeTokenFormPageFields[];
