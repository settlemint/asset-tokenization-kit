import { identityClaim } from "@atk/zod/claim";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Input schema for claims list endpoint.
 *
 * Supports querying claims for a user by either their wallet address
 * or their on-chain identity address.
 */
export const ClaimsListInputSchema = z.union([
  z.object({
    accountId: ethereumAddress.describe("Account address to fetch claims for"),
  }),
]);

/**
 * Output schema for claims list endpoint.
 *
 * Returns claims array and identity information for the requested user.
 */
export const ClaimsListOutputSchema = z.object({
  /**
   * Array of claims for the user with full information for revocation operations.
   * Empty array if user has no claims or no identity.
   */
  claims: z
    .array(identityClaim)
    .describe("User's identity claims with full information"),

  /**
   * User's on-chain identity address.
   * Undefined if user has no registered identity.
   */
  identity: ethereumAddress
    .optional()
    .describe("User's on-chain identity address"),

  /**
   * Whether the user has a registered on-chain identity.
   */
  isRegistered: z.boolean().describe("Whether user has on-chain identity"),

  /**
   * Id of the account for reference.
   */
  accountId: ethereumAddress.nullable().describe("User's wallet address"),
});

export type ClaimsListInput = z.infer<typeof ClaimsListInputSchema>;
export type ClaimsListOutput = z.infer<typeof ClaimsListOutputSchema>;
