import { z } from "zod/v4";

export const TokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
});

export const TokenListSchema = z.array(TokenSchema);
