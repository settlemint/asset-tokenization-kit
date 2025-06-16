import { onboardedMiddleware } from "@/orpc/middlewares/auth/onboarded.middleware";
import { authRouter } from "./auth.router";

/**
 * Onboarded ORPC router for procedures requiring completed user onboarding.
 *
 * This router extends the authenticated router with onboarding middleware,
 * creating a secure foundation for procedures that require users to have
 * completed the full onboarding process. It builds upon the authenticated
 * router's capabilities while adding strict onboarding enforcement.
 *
 * Middleware composition (inherited + added):
 * 1. Error middleware (from public router)
 * 2. Session middleware (from public router)
 * 3. TheGraph middleware (from auth router)
 * 4. Auth middleware (from auth router)
 * 5. Onboarded middleware - Enforces onboarding completion
 *
 * The onboarded middleware will:
 * - Verify user has completed all onboarding steps
 * - Check for required profile fields and verifications
 * - Throw NOT_ONBOARDED errors for incomplete onboarding
 * - Ensure account object exists in the auth context
 *
 * Use this router for procedures that require:
 * - Fully onboarded users with complete profiles
 * - Access to advanced platform features
 * - Compliance-dependent operations
 * - Features requiring verified user information
 *
 * @see {@link ./auth.router} - Authenticated router that this extends
 * @see {@link ../../middlewares/auth/onboarded.middleware} - Onboarding middleware
 */
export const onboardedRouter = authRouter.use(onboardedMiddleware);
