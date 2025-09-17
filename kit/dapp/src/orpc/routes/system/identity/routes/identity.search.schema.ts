import { IdentitySchema } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { ethereumHex } from "@atk/zod/ethereum-hex";
import { z } from "zod";

/**
 * Input schema for identity search
 * Accepts either account (to search by account address) or address (to search by identity contract address)
 */
export const IdentitySearchSchema = z
  .object({
    account: ethereumAddress
      .describe("The account address of the user to search the identity for")
      .optional(),
    address: ethereumAddress
      .describe("The identity contract address to search for")
      .optional(),
  })
  .refine((data) => data.account || data.address, {
    message: "Either account or address must be provided",
    path: ["account", "address"],
  });

/**
 * Output schema for identity search operations (identity without claims)
 */
export const IdentitySearchResultSchema = IdentitySchema.omit({
  claims: true,
}).nullable();

/**
 * GraphQL response schema for identity search queries (without claims)
 * Reuses structure from read schema but excludes claims
 */
export const IdentitySearchResponseSchema = z.object({
  identities: z
    .array(
      z.object({
        id: ethereumAddress,
        account: z.object({
          id: ethereumAddress,
        }),
        registered: z
          .array(
            z.object({
              id: ethereumHex,
              country: z.number(),
            })
          )
          .nullable()
          .optional(),
      })
    )
    .nullable()
    .optional(),
});

/**
 * Type definitions
 */
export type IdentitySearchInput = z.infer<typeof IdentitySearchSchema>;
export type IdentitySearchResult = z.infer<typeof IdentitySearchResultSchema>;
