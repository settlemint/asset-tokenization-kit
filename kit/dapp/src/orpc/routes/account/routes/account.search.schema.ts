import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

export const AccountSearchInputSchema = z.object({
  // Address-based search only
  query: z.string().min(1).describe("Search query for account address"),
  limit: z.number().int().positive().max(50).default(10),
});

export const AccountSearchResultSchema = z.object({
  id: ethereumAddress,
  isContract: z.boolean().optional(),
  contractName: z.string().optional(),
});

export type AccountSearchInput = z.infer<typeof AccountSearchInputSchema>;
export type AccountSearchResult = z.infer<typeof AccountSearchResultSchema>;
