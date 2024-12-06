import { isAddress } from 'viem';
import { z } from 'zod';

export const MintTokenSchema = z.object({
  to: z.string(),
  amount: z.coerce.number(),
  tokenAddress: z
    .string()
    .refine((address) => isAddress(address), { message: 'Please enter a valid Ethereum address' }),
});

export type MintTokenSchemaType = z.infer<typeof MintTokenSchema>;

export const mintTokenDefaultValues: MintTokenSchemaType = {
  to: '',
  amount: 0,
  tokenAddress: '0x',
} as const;

export type MintTokenFormStepFields = keyof typeof mintTokenDefaultValues;

export const mintTokenFormStepFields: MintTokenFormStepFields[] = Object.keys(
  mintTokenDefaultValues
) as MintTokenFormStepFields[];
