import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { assetSymbol } from "@atk/zod/asset-symbol";
import { assetType } from "@atk/zod/asset-types";
import { complianceModulePairArray } from "@atk/zod/compliance";
import { decimals } from "@atk/zod/decimals";
import { isin } from "@atk/zod/isin";
import { isoCountryCodeNumeric } from "@atk/zod/iso-country-code";
import { optionalString } from "@atk/zod/optional-string";
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
