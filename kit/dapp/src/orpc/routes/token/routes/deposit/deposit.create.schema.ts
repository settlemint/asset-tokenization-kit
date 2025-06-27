import { assetType } from "@/lib/zod/validators/asset-types";
import { decimals } from "@/lib/zod/validators/decimals";
import { isin } from "@/lib/zod/validators/isin";
import { z } from "zod/v4";

export const DepositTokenCreateSchema = z.object({
  type: assetType(),
  name: z.string().describe("The name of the deposit"),
  symbol: z.string().describe("The symbol of the deposit"),
  decimals: decimals(),
  isin: isin().optional(),
});
