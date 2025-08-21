/**
 * Secret Recovery Codes API Contract Definitions
 *
 * ARCHITECTURE: Defines ORPC contracts for backup authentication system that provides
 * recovery access when primary 2FA (TOTP) is unavailable. Secret codes serve as
 * emergency authentication bypass tokens.
 *
 * SECURITY MODEL:
 * - Generate: Creates cryptographically secure single-use recovery codes
 * - Confirm: Records user acknowledgment enabling stricter security requirements
 * - Codes are managed by Portal service with secure random generation
 * - Each code provides one-time authentication bypass capability
 *
 * DESIGN RATIONALE: Two-endpoint design separates code creation from user acknowledgment
 * to implement progressive security - confirmation enables password requirements for
 * future regeneration attempts.
 */

import { baseContract } from "@/orpc/procedures/base.contract";
import { secretCodesConfirmOutputSchema } from "./secret-codes.confirm.schema";
import { secretCodesGenerateOutputSchema } from "./secret-codes.generate.schema";

/**
 * Contract for generating secret recovery codes.
 *
 * @remarks
 * SECURITY: POST operation creates 8-12 cryptographically secure recovery codes via Portal API.
 * Each code is a single-use authentication bypass token for emergency account access.
 *
 * BUSINESS LOGIC: Requires password validation if codes were previously confirmed to prevent
 * unauthorized regeneration. First-time generation requires no additional authentication.
 *
 * DESIGN RATIONALE: Uses POST for generation (not GET) because operation has side effects:
 * - Invalidates existing codes
 * - Creates new verification state in Portal
 * - Updates local database with verification ID
 */
const generate = baseContract
  .route({
    method: "POST",
    path: "/user/secret-codes",
    description: "Generate secret recovery codes for the user",
    successDescription: "Secret codes generated successfully",
    tags: ["user", "security", "recovery"],
  })
  .output(secretCodesGenerateOutputSchema);

/**
 * Contract for confirming secret codes storage.
 *
 * @remarks
 * SECURITY: PATCH operation records user acknowledgment of recovery code storage.
 * This is a one-way security upgrade that enables stricter authentication requirements.
 *
 * BUSINESS LOGIC: Once confirmed, future code regeneration requires password validation.
 * This prevents unauthorized access to recovery codes by attackers with temporary access.
 *
 * DESIGN RATIONALE: Uses PATCH (not POST) to indicate state modification of existing
 * resource rather than creation of new entity. Operation is idempotent.
 */
const confirm = baseContract
  .route({
    method: "PATCH",
    path: "/user/secret-codes",
    description: "Confirm that secret codes have been stored",
    successDescription: "Secret codes confirmation recorded",
    tags: ["user", "security", "recovery"],
  })
  .output(secretCodesConfirmOutputSchema);

/**
 * Secret codes contract definition for ORPC route generation.
 *
 * @remarks
 * ARCHITECTURE: Exports contract objects for type-safe ORPC procedure definitions.
 * Contracts define HTTP methods, paths, schemas, and OpenAPI documentation.
 *
 * INTEGRATION: Used by ORPC to generate both client SDK and server route handlers
 * with end-to-end type safety from schema definitions to API responses.
 */
export const secretCodesContract = {
  generate,
  confirm,
};
