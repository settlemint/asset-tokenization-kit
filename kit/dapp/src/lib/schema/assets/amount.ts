import { z } from 'zod';

export const assetAmountSchema = (limit?: bigint) => (limit ? z.bigint().min(1n).max(limit) : z.bigint().min(1n));
