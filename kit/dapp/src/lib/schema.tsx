import type { Address, Hash } from 'viem';
import { z } from 'zod';

export const PincodeSchema = z
  .number()
  .min(100000, { message: 'Invalid pincode' })
  .max(999999, { message: 'Invalid pincode' });

export const DecimalsSchema = z
  .number()
  .min(0, { message: 'Must be at least 0' })
  .max(18, { message: 'Must be between 0 and 18' })
  .default(18);

export const AddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Must start with 0x followed by 40 hexadecimal characters',
  })
  .transform((val): Address => val as Address);

export const AmountSchema = z.number().min(1, { message: 'Must be at least 1' });

export const TransactionHashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Must start with 0x followed by 64 hexadecimal characters',
  })
  .transform((val): Hash => val as Hash);
