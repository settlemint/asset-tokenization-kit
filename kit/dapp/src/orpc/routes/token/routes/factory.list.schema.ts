import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
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

  /**
   * Whether the factory has created any tokens
   */
  hasTokens: z.boolean().describe("Whether the factory has created any tokens"),
});

/**
 * Schema for the list of token factories
 * Following the same pattern as TokenListSchema
 */
export const FactoryListSchema = z.array(TokenFactorySchema);

/**
 * List schema for token factories that extends the base ListSchema
 * with an optional filter for factories that have created tokens.
 */
export const TokenFactoryListSchema = ListSchema.extend({
  /**
   * Filter factories by whether they have created tokens.
   *
   * When not specified, all factories are returned.
   * When true, only factories with tokens are returned.
   * When false, only factories without tokens are returned.
   */
  hasTokens: z
    .boolean()
    .optional()
    .describe("Filter factories by whether they have created tokens"),
});

// Type exports
export type TokenFactory = z.infer<typeof TokenFactorySchema>;
export type FactoryList = z.infer<typeof FactoryListSchema>;
export type TokenFactoryListInput = z.infer<typeof TokenFactoryListSchema>;
