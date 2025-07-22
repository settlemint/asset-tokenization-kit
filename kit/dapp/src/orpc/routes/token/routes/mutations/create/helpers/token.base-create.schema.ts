import { assetSymbol } from "@/lib/zod/validators/asset-symbol";
import { assetType } from "@/lib/zod/validators/asset-types";
import { decimals } from "@/lib/zod/validators/decimals";
import { isin } from "@/lib/zod/validators/isin";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { z } from "zod";

const ModulePairSchema = z.object({
  module: z.string(),
  params: z.string(),
});

/**
 * Base fields common to all token types
 */
export const TokenBaseSchema = MutationInputSchema.extend({
  name: z.string().describe("The name of the token"),
  symbol: assetSymbol().describe("The symbol of the token"),
  decimals: decimals(),
  isin: isin().optional(),
  initialModulePairs: z.array(ModulePairSchema).default([]),
  requiredClaimTopics: z.array(z.string()).default([]),
  type: assetType(),
});
