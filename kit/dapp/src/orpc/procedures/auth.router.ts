import { sessionMiddleware } from "@/orpc/middlewares/auth/session.middleware";
import { authMiddleware } from "../middlewares/auth/auth.middleware";
import { publicRouter } from "./public.router";

/**
 * Authenticated ORPC router for protected procedures.
 *
 * This router extends the public router with authentication middleware,
 * creating a secure foundation for procedures that require valid user
 * authentication. It builds upon the public router's error handling and
 * session management while adding strict authentication enforcement.
 *
 * Middleware composition (inherited + added):
 * 1. Error middleware (from public router)
 * 2. Session middleware (from public router)
 * 3. Auth middleware - Enforces authentication requirements
 *
 * The auth middleware will:
 * - Validate authentication tokens/sessions
 * - Throw UNAUTHORIZED errors for invalid/missing auth
 * - Populate the context with authenticated user information
 * - Ensure only authenticated users can access protected procedures
 *
 * Use this router for procedures that require:
 * - Valid user authentication
 * - Access to user-specific data
 * - Protected operations (create, update, delete)
 * - User permission checks
 * @see {@link ./public.router} - Public router that this extends
 * @see {@link ../../middlewares/auth/auth.middleware} - Authentication middleware
 */
export const authRouter = publicRouter
  .use(sessionMiddleware)
  .use(authMiddleware);
