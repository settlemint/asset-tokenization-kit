import { isAddress } from 'viem';
import { z } from 'zod';

export const CreateAddressBookEntrySchema = z.object({
  walletName: z.string().min(1),
  walletAddress: z.string().refine((address) => isAddress(address), { message: 'Please enter a valid Wallet address' }),
});

export type CreateAddressBookEntrySchemaType = z.infer<typeof CreateAddressBookEntrySchema>;

export const createAddressBookEntryDefaultValues: CreateAddressBookEntrySchemaType = {
  walletName: '',
  walletAddress: '0x',
} as const;

export type CreateAddressBookEntryFormPageFields = keyof typeof createAddressBookEntryDefaultValues;

export const createAddressBookEntryFormStepFields: CreateAddressBookEntryFormPageFields[] = Object.keys(
  createAddressBookEntryDefaultValues
) as CreateAddressBookEntryFormPageFields[];
