/**
 * Schema for user read parameters.
 *
 * This schema defines the input parameters for reading a specific user
 * by either their ID or wallet address. Exactly one of these parameters
 * must be provided to identify the user to retrieve.
 */

import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { UserSchema } from "@/orpc/routes/user/routes/user.me.schema";
import { z } from "zod";

/**
 * Input schema for user read endpoint.
 *
 * Allows retrieving a user by either their internal ID or their wallet address.
 * Exactly one of userId or wallet must be provided.
 */
export const UserReadInputSchema = z
  .object({
    /**
     * User ID for lookup.
     *
     * The internal database ID of the user to retrieve.
     * Use this when you have the user's ID from other API calls.
     */
    userId: z.string().optional(),

    /**
     * Wallet address for lookup.
     *
     * The Ethereum wallet address of the user to retrieve.
     * Use this when you only have the user's wallet address.
     */
    wallet: ethereumAddress.optional(),
  })
  .refine(
    (data) => {
      // Exactly one of userId or wallet must be provided
      const hasUserId = Boolean(data.userId);
      const hasWallet = Boolean(data.wallet);
      return hasUserId !== hasWallet; // XOR: exactly one must be true
    },
    {
      message: "Exactly one of userId or wallet must be provided",
      path: ["userId", "wallet"],
    }
  );

/**
 * Output schema for user read result.
 *
 * Returns a single user object with all available information
 * including KYC data if available.
 */
export const UserReadOutputSchema = UserSchema;

export type UserReadInput = z.infer<typeof UserReadInputSchema>;
export type UserReadOutput = z.infer<typeof UserReadOutputSchema>;
