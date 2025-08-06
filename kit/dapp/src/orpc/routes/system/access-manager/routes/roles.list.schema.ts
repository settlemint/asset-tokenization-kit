import { accessControlRole } from "@/lib/zod/validators/access-control-roles";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

export const SystemRolesInputSchema = z.object({
  /**
   * Whether to exclude accounts that are contracts from the list
   */
  excludeContracts: z.boolean().default(false),
});

/**
 * Schema for the output of the roles list endpoint
 */
export const SystemRolesOutputSchema = z.array(
  z.object({
    roles: z.array(accessControlRole).describe("The roles of the account"),
    account: ethereumAddress.describe("The account address"),
  })
);

/**
 * Type definition for the input of the roles list endpoint
 */
export type SystemRolesOutput = z.infer<typeof SystemRolesOutputSchema>;
export type SystemRolesInput = z.infer<typeof SystemRolesInputSchema>;
