import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { expressionTypeKey } from "@atk/zod/expression-type";
import { isoCountryCodeNumeric } from "@atk/zod/iso-country-code";
import { z } from "zod";

export const TokenComplianceInputSchema = z.object({
  tokenAddress: ethereumAddress.describe("The token contract address"),
});

/**
 * Zod schema for the response of the ReadTokenQuery
 * representing compliance modules and their configs for a token.
 */
export const TokenComplianceResponseSchema = z.object({
  complianceModuleConfigs: z.array(
    z.object({
      complianceModule: z.object({
        typeId: z.string(),
        tokenConfigs: z.array(
          z.object({
            parameters: z.object({
              expression: z
                .array(
                  z.object({
                    topicScheme: z
                      .object({
                        name: z.string(),
                      })
                      .nullable(),
                    index: z.int(),
                    nodeType: expressionTypeKey(),
                  })
                )
                .nullable(),
              tokenSupplyLimit: z
                .object({
                  global: z.boolean(),
                  maxSupplyExact: apiBigInt,
                })
                .nullable(),
              countries: z.array(isoCountryCodeNumeric).nullable(),
            }),
          })
        ),
      }),
    })
  ),
});
