import { optionalString } from "@/lib/zod/utils/optional-string";
import { assetSymbol } from "@/lib/zod/validators/asset-symbol";
import { assetType } from "@/lib/zod/validators/asset-types";
import { complianceModulePairArray } from "@/lib/zod/validators/compliance";
import { decimals } from "@/lib/zod/validators/decimals";
import { isin } from "@/lib/zod/validators/isin";
import { isoCountryCodeNumeric } from "@/lib/zod/validators/iso-country-code";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { z } from "zod";

/**
 * Base fields common to all token types
 */
export const TokenBaseSchema = MutationInputSchema.extend({
  name: z.string().max(50).describe("The name of the token"),
  symbol: assetSymbol().describe("The symbol of the token"),
  decimals: decimals(),
  isin: optionalString(isin()),
  countryCode: isoCountryCodeNumeric.describe(
    "ISO 3166-1 numeric country code for jurisdiction"
  ),
  initialModulePairs: complianceModulePairArray().describe(
    "Initial compliance module pairs for the token"
  ),
  type: assetType(),
});
