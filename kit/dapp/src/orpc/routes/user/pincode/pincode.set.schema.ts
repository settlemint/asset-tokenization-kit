/**
 * Zod validation schemas for PIN code establishment endpoint.
 *
 * @remarks
 * VALIDATION STRATEGY: Leverages shared PIN validation from @atk/zod package
 * to ensure consistency across all PIN-related operations and prevent
 * validation drift between different parts of the application.
 *
 * INPUT DESIGN: Minimal schema with single PIN field because PIN creation
 * is inherently simple - no previous PIN validation or complex state needed.
 *
 * OUTPUT DESIGN: Includes verification ID for audit trails and client-side
 * confirmation, plus boolean success flag for consistent API responses.
 *
 * @see {@link @atk/zod/pincode} Shared PIN validation with security constraints
 */

import { pincode as pincodeValidator } from "@atk/zod/pincode";
import { z } from "zod";

/**
 * Input validation schema for PIN creation requests.
 *
 * @remarks
 * WHY OBJECT WRAPPER: Wraps PIN validator in object to allow future extension
 * with additional fields (e.g., confirmation PIN, security questions) without
 * breaking API compatibility.
 */
export const PincodeSetInputSchema = z.object({
  pincode: pincodeValidator,
});

/**
 * Output schema for successful PIN creation responses.
 *
 * @remarks
 * SECURITY: Verification ID is safe to expose as it doesn't contain PIN data,
 * only serves as an opaque reference to the Portal verification record.
 *
 * AUDIT: Verification ID enables client-side confirmation and logging without
 * exposing sensitive cryptographic details.
 */
export const PincodeSetOutputSchema = z.object({
  success: z.boolean(),
  verificationId: z.string(),
});

// TYPE INFERENCE: Leverage Zod's type inference for type-safe client generation
export type PincodeSetInput = z.infer<typeof PincodeSetInputSchema>;
export type PincodeSetOutput = z.infer<typeof PincodeSetOutputSchema>;
