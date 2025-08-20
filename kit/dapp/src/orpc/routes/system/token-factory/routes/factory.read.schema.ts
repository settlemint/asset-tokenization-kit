import { assetFactoryTypeId } from "@atk/zod/asset-types";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Schema for reading a specific token factory
 */
export const FactoryReadSchema = z.object({
  /**
   * The factory ID (contract address) to read
   */
  id: ethereumAddress.describe("The factory contract address to read"),
});

/**
 * Schema for a complete token factory with all details
 */
export const TokenFactoryDetailSchema = z.object({
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
  typeId: assetFactoryTypeId().describe("The type ID of the token factory"),
});

// Type exports
export type FactoryReadInput = z.infer<typeof FactoryReadSchema>;
export type TokenFactoryDetail = z.infer<typeof TokenFactoryDetailSchema>;
