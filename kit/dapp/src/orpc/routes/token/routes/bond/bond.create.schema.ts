import { z } from 'zod/v4';
import { amount } from '@/lib/zod/validators/amount';
import { assetType } from '@/lib/zod/validators/asset-types';
import { decimals } from '@/lib/zod/validators/decimals';
import { ethereumAddress } from '@/lib/zod/validators/ethereum-address';
import { isin } from '@/lib/zod/validators/isin';
import { timestamp } from '@/lib/zod/validators/timestamp';

export const BondTokenCreateSchema = z.object({
  type: assetType(),
  name: z.string().describe('The name of the bond'),
  symbol: z.string().describe('The symbol of the bond'),
  decimals: decimals(),
  isin: isin().optional(),
  cap: amount().describe('Maximum issuance amount'),
  faceValue: amount().describe('Face value of the bond'),
  maturityDate: timestamp().describe('Maturity date of the bond'),
  underlyingAsset: ethereumAddress.describe(
    'The address of the underlying asset'
  ),
});
