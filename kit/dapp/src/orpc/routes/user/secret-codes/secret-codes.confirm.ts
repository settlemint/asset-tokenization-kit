/**
 * Secret Recovery Codes Confirmation Endpoint
 *
 * ARCHITECTURE: Records user acknowledgment of recovery code storage, implementing a
 * progressive security model where confirmation enables stricter authentication requirements.
 *
 * SECURITY MODEL:
 * - Confirms user has securely stored generated recovery codes
 * - Enables password requirements for future code regeneration
 * - Creates irreversible security upgrade (one-way operation)
 * - Prevents unauthorized code access by temporary attackers
 *
 * BUSINESS LOGIC:
 * - Simple boolean flag update in local database
 * - No Portal API interaction (confirmation is local state)
 * - Idempotent operation (can be called multiple times safely)
 * - Triggers security policy changes for subsequent operations
 *
 * DESIGN RATIONALE: Separate confirmation step ensures users understand the importance
 * of code storage before enabling stricter security measures. Two-phase approach balances
 * setup convenience with security enforcement.
 */

import { user } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm/sql";

/**
 * Confirms user has stored secret recovery codes, enabling stricter security requirements.
 *
 * @remarks
 * SECURITY: One-way security upgrade that enables password requirements for future operations.
 * Once confirmed, users must provide password for code regeneration to prevent unauthorized access.
 *
 * BUSINESS LOGIC: Simple boolean flag update with significant security implications:
 * - Irreversible operation (cannot "unconfirm" codes)
 * - Enables password requirements for regeneration
 * - Indicates user understanding of code importance
 *
 * PERFORMANCE: Single local database update with no external API calls.
 * Operation completes immediately without Portal service interaction.
 *
 * ERROR HANDLING: Relies on database middleware error handling.
 * No custom error cases since operation only updates boolean flag.
 *
 * @returns Success status indicator
 * @throws Database errors bubble up through middleware
 */
export const confirm = authRouter.user.secretCodes.confirm
  .use(databaseMiddleware)
  .handler(async function ({ context: { auth, db } }) {
    // SECURITY: One-way security upgrade - enables password requirements for future regeneration
    // WHY: Prevents unauthorized code access by attackers with temporary session access
    await db
      .update(user)
      .set({
        secretCodesConfirmed: true,
      })
      .where(eq(user.id, auth.user.id));

    // BUSINESS LOGIC: Return success indicator for client confirmation UI
    return {
      success: true,
    };
  });
