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

import { hasuraMetadataClient } from "@/lib/settlemint/hasura";
import { postgresPool } from "@/lib/settlemint/postgres";
import { trackAllTables } from "@settlemint/sdk-hasura";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { serverOnly } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schemas from "./schema";

const logger = createLogger();

let migrationStatus: "migrating" | "migrated" | "none" = "none";

/**
 * Migrates the database to the latest version.
 *
 * This function is used to migrate the database to the latest version.
 * It is called when the application starts.
 *
 */
export const migrateDatabase = async () => {
  if (migrationStatus !== "none") {
    return;
  }
  migrationStatus = "migrating";
  try {
    const db = getDb();
    logger.info("Migrating the database");
    await migrate(db, {
      migrationsFolder: "drizzle",
    });
    logger.info("Completed migrating the database");
  } catch (err) {
    const error = err as Error;
    logger.error(`Error migrating the database: ${error.message}`, error);
    // Exit the process with a non-zero code to indicate failure, if migration fails the app will not function properly
    process.exit(1);
  }

  try {
    logger.info("Tracking all tables in Hasura");
    const database = postgresPool.options.database ?? "default";
    await trackAllTables(database, hasuraMetadataClient, {
      excludeSchemas: ["drizzle"],
    });
    logger.info("Completed tracking all tables in Hasura");
  } catch (err) {
    const error = err as Error;
    // Tracking all tables in Hasura is not critical, so we can continue even if it fails
    logger.error(
      `Error tracking all tables in Hasura: ${error.message}`,
      error
    );
  }

  migrationStatus = "migrated";
};

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
const getDb = serverOnly(() => {
  return drizzle(postgresPool, {
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
  });
});

/**
 * Creates the Drizzle ORM database instance and migrates the database to the latest version.
 */
const getMigratedDb = serverOnly(async () => {
  await migrateDatabase();
  return getDb();
});

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
export const db = await getMigratedDb();
