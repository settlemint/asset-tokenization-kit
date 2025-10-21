import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

export const AccountSearchGraphResponseSchema = z.object({
  account: z
    .object({
      id: ethereumAddress,
      isContract: z.boolean(),
      contractName: z.string().nullable().optional(),
    })
    .nullable(),
});

export const AccountSearchInputSchema = z.object({
  // Address-based search only
  query: z.string().min(1).describe("Search query for account address"),
  limit: z.number().int().positive().max(50).default(10),
});

export const AccountSearchResultSchema = z.object({
  id: ethereumAddress,
  isContract: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether the account is a contract"),
  contractName: z.string().optional().describe("The name of the contract"),
  displayName: z
    .string()
    .optional()
    .describe("The display name of the account"),
});

export type AccountSearchGraphResponse = z.infer<
  typeof AccountSearchGraphResponseSchema
>;
export type AccountSearchInput = z.infer<typeof AccountSearchInputSchema>;
export type AccountSearchResult = z.infer<typeof AccountSearchResultSchema>;
