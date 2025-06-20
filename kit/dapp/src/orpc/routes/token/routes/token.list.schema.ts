import { decimals } from "@/lib/zod/validators/decimals";
import { z } from "zod/v4";

export const TokenSchema = z.object({
  id: z.string(),
  name: z.string().describe("The name of the token"),
  symbol: z.string().describe("The symbol of the token"),
  decimals: decimals(),
});

export const TokenListSchema = z.array(TokenSchema);
