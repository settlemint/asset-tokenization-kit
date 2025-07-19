import { sessionMiddleware } from "../middlewares/auth/session.middleware";
import { i18nMiddleware } from "../middlewares/i18n/i18n.middleware";
import { errorMiddleware } from "../middlewares/monitoring/error.middleware";
import { baseRouter } from "./base.router";

/**
 * Public ORPC router for unauthenticated procedures.
 *
 * This router extends the base router with essential middleware for public
 * endpoints that don't require authentication. It provides a foundation for
 * procedures that should be accessible to all users, whether authenticated or not.
 *
 * Middleware composition (applied in order):
 * 1. Sentry tracing middleware - Adds distributed tracing with Sentry
 * 2. Error middleware - Handles and formats all errors consistently
 * 3. i18n middleware - Provides internationalization support based on user language
 * 4. Session middleware - Optionally loads session data if available
 *
 * The session middleware is included even for public routes because:
 * - Some public endpoints may behave differently for authenticated users
 * - It allows optional authentication without requiring it
 * - Provides consistent session handling across all endpoints
 *
 * The i18n middleware enables:
 * - Automatic language detection from client context
 * - Server-side translations using the same translation files as the frontend
 * - Default to English for direct API calls without language context
 *
 * Use this router for procedures like:
 * - Public content retrieval
 * - Health checks and status endpoints
 * - Public API endpoints with optional user context
 * @see {@link ../../middlewares/monitoring/error.middleware} - Error handling middleware
 * @see {@link ../../middlewares/monitoring/sentry-tracing.middleware} - Sentry tracing middleware
 * @see {@link ../../middlewares/i18n/i18n.middleware} - Internationalization middleware
 * @see {@link ../../middlewares/auth/session.middleware} - Session loading middleware
 * @see {@link ./base.router} - Base router implementation
 */
export const publicRouter = baseRouter
  .use(errorMiddleware)
  .use(i18nMiddleware)
  .use(sessionMiddleware);
