import { sessionMiddleware } from "../../middlewares/auth/session.middleware";
import { errorMiddleware } from "../../middlewares/monitoring/error.middleware";
import { tracingMiddleware } from "../../middlewares/monitoring/tracing.middleware";
import { br } from "./base.router";

/**
 * Public ORPC router for unauthenticated procedures.
 *
 * This router extends the base router with essential middleware for public
 * endpoints that don't require authentication. It provides a foundation for
 * procedures that should be accessible to all users, whether authenticated or not.
 *
 * Middleware composition (applied in order):
 * 1. Tracing middleware - Adds tracing information to the request
 * 2. Error middleware - Handles and formats all errors consistently
 * 3. Session middleware - Optionally loads session data if available
 *
 * The session middleware is included even for public routes because:
 * - Some public endpoints may behave differently for authenticated users
 * - It allows optional authentication without requiring it
 * - Provides consistent session handling across all endpoints
 *
 * Use this router for procedures like:
 * - Public content retrieval
 * - Health checks and status endpoints
 * - Public API endpoints with optional user context
 *
 * @see {@link ../../middlewares/monitoring/error.middleware} - Error handling middleware
 * @see {@link ../../middlewares/monitoring/tracing.middleware} - Tracing middleware
 * @see {@link ../../middlewares/auth/session.middleware} - Session loading middleware
 * @see {@link ./base.router} - Base router implementation
 */
export const pr = br
  .use(tracingMiddleware)
  .use(errorMiddleware)
  .use(sessionMiddleware);
