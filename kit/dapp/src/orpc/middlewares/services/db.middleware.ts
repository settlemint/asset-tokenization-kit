import { db } from "@/lib/db";
import type { Context } from "@/orpc/context/context";
import { baseRouter } from "../../procedures/base.router";

/**
 * Database connection middleware.
 *
 * This middleware ensures that all procedures have access to the database
 * connection through the request context. It provides a consistent way to
 * inject the database instance into procedure handlers, enabling database
 * operations while maintaining testability and dependency injection patterns.
 *
 * The middleware:
 * - Checks if a database connection already exists in context
 * - If not present, injects the default database instance
 * - Ensures all procedures have access to context.db
 * - Supports dependency injection for testing (mock databases)
 *
 * This middleware is typically used early in the middleware chain to ensure
 * database access is available to all subsequent middleware and handlers.
 *
 * Benefits:
 * - Consistent database access across all procedures
 * - Testability through dependency injection
 * - Centralized database connection management
 * - Optional database context (procedures can work without DB if needed)
 * @example
 * ```typescript
 * // Used in router setup
 * export const pr = baseRouter.use(errorMiddleware).use(databaseMiddleware);
 *
 * // In a procedure handler
 * export const getUsers = pr.users.list.handler(async ({ context }) => {
 *   // context.db is guaranteed to be available
 *   const users = await context.db.users.findMany();
 *   return users;
 * });
 * ```
 * @example
 * ```typescript
 * // Testing with mock database
 * const mockDb = createMockDatabase();
 * const testContext = { db: mockDb, headers: new Headers() };
 *
 * // The middleware will use the existing mock db instead of injecting the real one
 * ```
 * @see {@link @/lib/db} - Database configuration and connection
 */
export const databaseMiddleware = baseRouter.middleware<
  Pick<Context, "db">,
  unknown
>(async ({ context, next }) => {
  return next({
    context: {
      // Use existing database connection if available (e.g., for testing),
      // otherwise inject the default database instance
      db: context.db ?? db,
    },
  });
});
