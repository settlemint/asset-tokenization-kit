/**
 * Secret Recovery Codes Confirmation Response Schema
 *
 * VALIDATION DESIGN: Simple success indicator schema for confirmation endpoint.
 * Minimal response structure reflects the straightforward nature of the operation.
 *
 * SECURITY CONSIDERATIONS:
 * - Operation is one-way security upgrade (cannot be undone)
 * - Success response indicates security policies have been updated
 * - Boolean type prevents ambiguous response states
 *
 * BUSINESS LOGIC: Schema enforces simple success/failure response pattern:
 * - Boolean success flag provides clear operation result
 * - No additional data needed since confirmation only sets database flag
 * - Consistent with other simple operation responses in the system
 */

import { z } from "zod";

/**
 * Response schema for secret recovery codes confirmation.
 *
 * @remarks
 * VALIDATION: Simple boolean success indicator for operation completion.
 * No additional response data needed since confirmation only updates local state.
 *
 * SECURITY: Success response indicates security upgrade has been applied.
 * Future code regeneration will now require password authentication.
 *
 * @property success - Operation completion status indicator
 */
export const secretCodesConfirmOutputSchema = z.object({
  success: z.boolean(),
});

/**
 * TypeScript type for secret codes confirmation response.
 *
 * @remarks
 * Inferred from Zod schema to maintain single source of truth for validation logic.
 * Provides compile-time type safety for API consumers and prevents type drift.
 */
export type SecretCodesConfirmOutput = z.infer<
  typeof secretCodesConfirmOutputSchema
>;
