import { z } from 'zod/v4';
import { TokenSchema } from '@/orpc/routes/token/routes/token.read.schema';

export const TokenListSchema = z.array(TokenSchema);
