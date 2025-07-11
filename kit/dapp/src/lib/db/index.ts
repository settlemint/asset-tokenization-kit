/**
 * Database Connection Module
 *
 * This module establishes and exports the main database connection for the application
 * using Drizzle ORM with PostgreSQL. It provides a type-safe database client that
 * integrates with the application's schema definitions.
 *
 * The database connection is configured to:
 * - Use connection pooling for efficient resource management
 * - Enable query logging in development for debugging
 * - Provide full TypeScript type safety through schema integration
 * - Ensure server-only execution to prevent client-side database access
 * @see {@link ./schema} - Database schema definitions
 * @see {@link ../settlemint/postgres} - PostgreSQL connection pool configuration
 */

import { postgresPool } from "@/lib/settlemint/postgres";
import { serverOnly } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schemas from "./schema";

/**
 * Creates the Drizzle ORM database instance.
 *
 * This function is wrapped with `serverOnly` to ensure database connections
 * are only established on the server side, preventing exposure of database
 * credentials and direct database access from the client.
 *
 * Configuration:
 * - Uses the PostgreSQL connection pool for efficient connection management
 * - Enables query logging in development mode for debugging SQL queries
 * - Integrates all schema definitions for type-safe database operations
 */
const getDb = serverOnly(() =>
  drizzle(postgresPool, {
    /**
     * Query logging configuration.
     * When enabled in development, logs all SQL queries to the console
     * for debugging and performance analysis.
     */
    // logger: process.env.NODE_ENV === "development",

    /**
     * Schema definitions for type-safe queries.
     * Includes all table schemas from the schema module,
     * providing full TypeScript support for database operations.
     */
    schema: schemas,
  })
);

/**
 * The main database client instance.
 *
 * This instance is used throughout the application for all database operations.
 * It provides:
 * - Type-safe query building with full TypeScript support
 * - Automatic query result typing based on schema definitions
 * - Connection pooling for optimal performance
 * - Transaction support for complex operations
 * @example
 * ```typescript
 * // Select users
 * const users = await db.select().from(schema.user);
 *
 * // Insert with type safety
 * await db.insert(schema.user).values({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 *
 * // Complex queries with joins
 * const userSessions = await db
 *   .select()
 *   .from(schema.user)
 *   .leftJoin(schema.session, eq(schema.user.id, schema.session.userId));
 * ```
 */
export const db = getDb();
