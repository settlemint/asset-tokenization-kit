import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Input schema for claims list endpoint.
 *
 * Supports querying claims for a user by either their internal ID
 * or their wallet address (discriminated union).
 */
export const ClaimsListInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("userId"),
    userId: z.string().describe("Internal user ID to fetch claims for"),
  }),
  z.object({
    type: z.literal("wallet"),
    wallet: ethereumAddress.describe("Wallet address to fetch claims for"),
  }),
]);

/**
 * Output schema for claims list endpoint.
 *
 * Returns claims array and identity information for the requested user.
 */
export const ClaimsListOutputSchema = z.object({
  /**
   * Array of claim names for the user.
   * Empty array if user has no claims or no identity.
   */
  claims: z.array(z.string()).describe("User's identity claim names"),

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
   * User's wallet address for reference.
   */
  wallet: ethereumAddress.nullable().describe("User's wallet address"),
});

export type ClaimsListInput = z.infer<typeof ClaimsListInputSchema>;
export type ClaimsListOutput = z.infer<typeof ClaimsListOutputSchema>;
