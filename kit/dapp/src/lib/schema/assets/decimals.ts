import { z } from 'zod';

export const assetDecimalsSchema = z
  .number()
  .min(0, { message: 'Decimals must be at least 0' })
  .max(18, { message: 'Decimals must be between 0 and 18' })
  .default(18);
