import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

/**
 * Input schema for Portal system read
 */
export const SystemPortalReadSchema = z.object({
  /**
   * The system contract address to query
   * @example "0x5e771e1417100000000000000000000000020088"
   */
  id: ethereumAddress.describe("The system contract address"),
});

/**
 * Output schema for Portal system read
 */
export const SystemPortalReadOutputSchema = z.object({
  /**
   * The tokenFactoryRegistry address from the system
   * May be null if the query fails or system is not fully initialized
   */
  tokenFactoryRegistry: ethereumAddress.nullable(),
});

export type SystemPortalReadInput = z.infer<typeof SystemPortalReadSchema>;
export type SystemPortalReadOutput = z.infer<
  typeof SystemPortalReadOutputSchema
>;
