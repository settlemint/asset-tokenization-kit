import { z } from "zod/v4";

/**
 * Messages schema for account creation operation
 * Provides typed, localized messages with English defaults
 */
export const AccountCreateMessagesSchema = z.object({
  walletCreated: z
    .string()
    .optional()
    .default("Wallet successfully created."),
  walletAlreadyExists: z
    .string()
    .optional()
    .default("Wallet already exists for this user."),
  walletCreationFailed: z
    .string()
    .optional()
    .default("Failed to create wallet. Please try again."),
});

export const AccountCreateSchema = z.object({
  userId: z.string().describe("The id of the user to create an account for"),
  /**
   * Optional custom messages for the operation.
   * If not provided, default English messages will be used.
   * This allows for localization by passing translated messages from the client.
   */
  messages: AccountCreateMessagesSchema.optional(),
});

// Type exports
export type AccountCreateMessages = z.infer<typeof AccountCreateMessagesSchema>;
