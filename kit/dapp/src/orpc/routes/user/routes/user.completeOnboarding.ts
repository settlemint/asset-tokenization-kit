/**
 * Complete Onboarding Handler
 *
 * This handler marks the current user's onboarding as complete by updating
 * the onboardingCompleted flag in the database. This is called when users
 * finish the onboarding wizard flow.
 * @see {@link @/orpc/procedures/auth.router} - Authentication requirements
 */

import { updateSession } from "@/lib/auth/plugins/utils";
import { user as userTable } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

/**
 * Mark onboarding as complete for the current user.
 *
 * Updates the user's onboardingCompleted field to true in the database
 * and refreshes the session to reflect the change.
 * @auth Required - User must be authenticated
 * @function POST /user/complete-onboarding
 * @param context - Request context containing authenticated user information
 * @returns Success confirmation
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If database update fails
 * @example
 * ```typescript
 * // Client usage:
 * const result = await orpc.user.completeOnboarding.mutate();
 * console.log(`Onboarding completed: ${result.success}`);
 *
 * // Use in React component
 * const completeMutation = orpc.user.completeOnboarding.useMutation();
 * const handleComplete = () => completeMutation.mutate();
 * ```
 */
export const completeOnboarding = authRouter.user.completeOnboarding
  .use(databaseMiddleware)
  .handler(async ({ context }) => {
    const userId = context.auth.user.id;

    // Update the user's onboarding completion status in the database
    await context.db
      .update(userTable)
      .set({ onboardingCompleted: true })
      .where(eq(userTable.id, userId));

    // Update the session to reflect the change immediately
    await updateSession(context as any, {
      onboardingCompleted: true,
    });

    return { success: true };
  });
