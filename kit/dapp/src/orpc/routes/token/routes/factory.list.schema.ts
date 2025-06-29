import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod/v4";

/**
 * Schema for a token factory in the list
 */
export const TokenFactorySchema = z.object({
  /**
   * The factory contract address
   */
  id: ethereumAddress.describe("The factory contract address"),

  /**
   * The name of the token factory
   */
  name: z.string().describe("The name of the token factory"),

  /**
   * The type ID of the token factory
   */
  typeId: z.string().describe("The type ID of the token factory"),
});

/**
 * Schema for the list of token factories
 * Following the same pattern as TokenListSchema
 */
export const FactoryListSchema = z.array(TokenFactorySchema);

// Type exports
export type TokenFactory = z.infer<typeof TokenFactorySchema>;
export type FactoryList = z.infer<typeof FactoryListSchema>;
