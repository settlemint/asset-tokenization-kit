/**
 * Zod validation schema for PIN code removal endpoint.
 *
 * @remarks
 * MINIMAL SCHEMA DESIGN: PIN removal requires no input validation because
 * it operates on the authenticated user's existing PIN state only. The endpoint
 * is inherently safe due to session-based user identification.
 *
 * OUTPUT SIMPLICITY: Returns only success flag because PIN removal is a
 * destructive operation that doesn't generate new resources or references.
 * No verification ID is needed since the PIN state is being eliminated.
 *
 * SECURITY BY DESIGN: No sensitive data in request or response reduces
 * attack surface and prevents accidental data exposure in logs or client storage.
 *
 * @see {@link ./pincode.set.schema} PIN creation with verification ID output
 * @see {@link ./pincode.update.schema} PIN update with verification ID output
 */

import { z } from "zod";

/**
 * Output schema for PIN removal responses.
 *
 * @remarks
 * WHY MINIMAL: PIN removal eliminates security state rather than creating it,
 * so there's no meaningful data to return beyond operation confirmation.
 *
 * CONSISTENCY: Boolean success field maintains API consistency with other
 * PIN operations while keeping response payload minimal for security.
 */
export const PincodeRemoveOutputSchema = z.object({
  success: z.boolean(),
});

// TYPE INFERENCE: Simple type for straightforward removal operation response
export type PincodeRemoveOutput = z.infer<typeof PincodeRemoveOutputSchema>;
