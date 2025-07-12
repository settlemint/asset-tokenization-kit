/**
 * User Profile Schemas
 *
 * This module defines the schema for user profile information returned by
 * the /user/me endpoint. It ensures type safety and validation for user
 * data throughout the application.
 */

import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { userRoles } from "@/lib/zod/validators/user-roles";
import { z } from "zod/v4";

/**
 * Schema for authenticated user information.
 *
 * Defines the structure of user data returned by the me endpoint,
 * including essential profile information and blockchain wallet address.
 * @example
 * ```typescript
 * const userData: User = {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   wallet: "0x1234567890123456789012345678901234567890",
 *   country: "US",
 *   claims: [
 *     {
 *       name: "KYC",
 *       values: {
 *         "level": "verified",
 *         "date": "2024-01-01"
 *       }
 *     }
 *   ]
 * };
 * ```
 */
export const UserMeSchema = z.object({
  id: z.string(),

  /**
   * User's display name.
   * Used for personalization and identification in the UI.
   */
  name: z.string(),

  /**
   * User's email address.
   * Primary identifier for authentication and communication.
   */
  email: z.email(),

  /**
   * User's role in the system.
   * Determines access permissions and onboarding flow.
   * - admin: First user, can perform platform onboarding
   * - issuer: Can issue assets
   * - user: Standard user (investors)
   */
  role: userRoles().default("investor"),

  /**
   * User's Ethereum wallet address.
   * Used for blockchain transactions and ownership verification.
   */
  wallet: ethereumAddress,

  /**
   * Whether the user has completed the onboarding process.
   */
  isOnboarded: z.boolean(),

  /**
   * User's first name from KYC profile.
   * Optional as it may not be set if KYC is not completed.
   */
  firstName: z.string().optional(),

  /**
   * User's last name from KYC profile.
   * Optional as it may not be set if KYC is not completed.
   */
  lastName: z.string().optional(),
});

/**
 * TypeScript type derived from the UserMeSchema.
 *
 * Provides compile-time type safety for user objects throughout
 * the application, ensuring consistency with the validation schema.
 */
export type User = z.infer<typeof UserMeSchema>;
