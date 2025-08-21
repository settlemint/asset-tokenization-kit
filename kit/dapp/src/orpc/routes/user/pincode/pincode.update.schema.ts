/**
 * Zod validation schemas for PIN code update endpoint.
 *
 * @remarks
 * SCHEMA CONSISTENCY: Intentionally identical to PIN creation schemas because
 * update operations have the same input/output requirements. This consistency
 * simplifies client-side code and reduces cognitive overhead.
 *
 * VALIDATION REUSE: Uses the same PIN validator as creation to ensure identical
 * security constraints apply to both initial setup and subsequent modifications.
 *
 * OUTPUT SIMILARITY: Returns new verification ID because Portal creates new
 * verification records for updates rather than modifying existing ones.
 *
 * @see {@link ./pincode.set.schema} PIN creation schemas (identical structure)
 * @see {@link @atk/zod/pincode} Shared PIN validation rules
 */

import { pincode as pincodeValidator } from "@atk/zod/pincode";
import { z } from "zod";

/**
 * Input validation schema for PIN update requests.
 *
 * @remarks
 * NO CURRENT PIN: Update endpoint doesn't require current PIN validation
 * because session authentication provides sufficient user verification.
 * This design choice improves UX for password manager users and admin operations.
 */
export const PincodeUpdateInputSchema = z.object({
  pincode: pincodeValidator,
});

/**
 * Output schema for successful PIN update responses.
 *
 * @remarks
 * NEW VERIFICATION ID: Always returns a new verification ID because Portal
 * creates fresh verification records for each update, enabling better audit
 * trails and security posture management.
 */
export const PincodeUpdateOutputSchema = z.object({
  success: z.boolean(),
  verificationId: z.string(),
});

// TYPE INFERENCE: Consistent type generation pattern across all PIN schemas
export type PincodeUpdateInput = z.infer<typeof PincodeUpdateInputSchema>;
export type PincodeUpdateOutput = z.infer<typeof PincodeUpdateOutputSchema>;
