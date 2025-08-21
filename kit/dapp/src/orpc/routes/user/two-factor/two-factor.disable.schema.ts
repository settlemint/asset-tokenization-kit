/**
 * Two-Factor Authentication Disable Request/Response Schemas
 *
 * VALIDATION DESIGN: Simple schema for 2FA removal operations.
 * Schema relies on session authentication for security.
 *
 * SECURITY CONSIDERATIONS:
 * - Session authentication required via middleware
 * - status: Boolean success indicator for operation completion
 * - No additional password required as session is already authenticated
 *
 * BUSINESS LOGIC: Simplified flow for better UX:
 * - Authenticated session is sufficient for 2FA management
 * - Simple boolean response indicates successful security state change
 */

import { z } from "zod";

/**
 * Input schema for two-factor authentication disabling.
 *
 * @remarks
 * SECURITY: Empty object as session authentication is sufficient.
 * Session middleware ensures only authenticated users can disable 2FA.
 *
 * VALIDATION: No additional input required for this operation.
 */
export const twoFactorDisableInputSchema = z.object({});

/**
 * Response schema for two-factor authentication disabling.
 *
 * @remarks
 * VALIDATION: Simple boolean status indicator for operation completion.
 * Success response indicates both Portal cleanup and local state updates completed.
 *
 * BUSINESS LOGIC: Boolean status provides clear operation result without sensitive data.
 * No additional response information needed for security state change confirmation.
 *
 * @property status - Operation completion status indicator
 */
export const twoFactorDisableOutputSchema = z.object({
  status: z.boolean(),
});

/**
 * TypeScript type for two-factor disable request.
 *
 * @remarks
 * Inferred from Zod schema to maintain single source of truth for validation logic.
 * Provides compile-time type safety for API consumers and prevents type drift.
 */
export type TwoFactorDisableInput = z.infer<typeof twoFactorDisableInputSchema>;

/**
 * TypeScript type for two-factor disable response.
 *
 * @remarks
 * Inferred from Zod schema to maintain single source of truth for validation logic.
 * Provides compile-time type safety for API consumers and prevents type drift.
 */
export type TwoFactorDisableOutput = z.infer<
  typeof twoFactorDisableOutputSchema
>;
