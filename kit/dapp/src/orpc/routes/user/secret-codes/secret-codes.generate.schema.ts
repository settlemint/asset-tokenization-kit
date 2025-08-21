/**
 * Secret Recovery Codes Generation Response Schema
 *
 * VALIDATION DESIGN: Defines strict output structure for recovery code generation endpoint.
 * Schema ensures consistent API responses and enables client-side type safety.
 *
 * SECURITY CONSIDERATIONS:
 * - secretCodes: Array of single-use authentication bypass tokens
 * - verificationId: Portal verification identifier for code management operations
 * - Both fields required to prevent partial responses that could break client logic
 *
 * BUSINESS LOGIC: Schema enforces complete response structure:
 * - Codes must be array (never single string to prevent parsing issues)
 * - Verification ID must be present (required for regeneration/cleanup)
 * - Type inference provides compile-time safety for API consumers
 */

import { z } from "zod";

/**
 * Response schema for secret recovery codes generation.
 *
 * @remarks
 * VALIDATION: Ensures complete response structure with both codes and management ID.
 * Portal service generates 8-12 codes typically, but schema accepts any array length.
 *
 * SECURITY: Contains sensitive authentication bypass tokens - client must handle securely.
 * Codes should be displayed once and stored by user in secure location.
 *
 * @property secretCodes - Array of single-use recovery authentication tokens
 * @property verificationId - Portal verification ID for future code management
 */
export const secretCodesGenerateOutputSchema = z.object({
  secretCodes: z.array(z.string()),
  verificationId: z.string(),
});

/**
 * TypeScript type for secret codes generation response.
 *
 * @remarks
 * Inferred from Zod schema to maintain single source of truth for validation logic.
 * Provides compile-time type safety for API consumers and prevents type drift.
 */
export type SecretCodesGenerateOutput = z.infer<
  typeof secretCodesGenerateOutputSchema
>;
