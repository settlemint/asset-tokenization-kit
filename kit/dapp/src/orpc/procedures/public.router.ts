import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { baseRouter } from "./base.router";

/**
 * Public ORPC router for unauthenticated procedures.
 *
 * This router extends the base router with essential middleware for public
 * endpoints that don't require authentication. It provides a foundation for
 * procedures that should be accessible to all users, whether authenticated or not.
 *
 * Middleware composition (applied in order):
 * 1. Session middleware - Optionally loads session data if available
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
 * @see {@link ../../middlewares/auth/session.middleware} - Session loading middleware
 * @see {@link ./base.router} - Base router implementation
 */
export const publicRouter = baseRouter
  .use(theGraphMiddleware)
  .use(portalMiddleware);
