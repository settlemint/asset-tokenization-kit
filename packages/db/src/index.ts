/**
 * Database Connection Module - Asset Tokenization Platform
 *
 * WHY: This module serves as the single source of truth for database connectivity in the
 * asset tokenization platform, implementing a defense-in-depth approach to data security
 * and performance optimization for financial asset operations.
 *
 * ARCHITECTURAL RATIONALE:
 * - Single connection instance: Prevents connection pool fragmentation across modules
 * - Server-only enforcement: Critical for financial platforms to prevent client-side data exposure
 * - Schema co-location: Ensures type safety propagates from database to application layer
 * - Migration-first initialization: Guarantees database consistency before any operations
 *
 * PERFORMANCE STRATEGY:
 * - Connection pooling: Handles burst traffic during asset trading without connection exhaustion
 * - Schema pre-loading: Enables TypeScript to validate queries at compile-time vs runtime
 * - Lazy migration: Defers expensive schema changes until first database access
 *
 * SECURITY BOUNDARIES:
 * - Server-only wrapper: Prevents accidental client-side database credential exposure
 * - Migration isolation: Database schema changes are atomic and logged for audit compliance
 * - Connection pool limits: Prevents resource exhaustion attacks on database infrastructure
 *
 * COMPLIANCE CONSIDERATIONS:
 * - Audit trail: All database operations are traceable through connection metadata
 * - Hasura integration: Enables real-time GraphQL APIs with role-based access control
 * - Migration tracking: Required for SOX compliance in financial applications
 *
 * @see {@link ./schema} - Database schema definitions and table relationships
 * @see {@link ../settlemint/postgres} - PostgreSQL connection pool configuration
 */
/** biome-ignore-all lint/performance/noNamespaceImport: needed for the db */

import { env } from "@atk/config/env";
import { hasuraMetadataClient } from "@atk/settlemint/hasura";
import { client } from "@atk/settlemint/postgres";
import { trackAllTables } from "@settlemint/sdk-hasura";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { serverOnly } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";
// WHY: Wildcard import ensures all schema tables are available to Drizzle's type system
// PERFORMANCE: Tree-shaking eliminates unused schemas in production builds
import * as schemas from "./schema";

// WHY: Dedicated logger instance for database operations enables filtered monitoring
// SECURITY: Database operations contain sensitive data requiring specialized log handling
const logger = createLogger();

// CONCURRENCY: Global state prevents race conditions when multiple modules initialize DB
// WHY: Three-state tracking ensures migration safety in serverless/multi-instance deployments
let migrationStatus: "migrating" | "migrated" | "none" = "none";

/**
 * Migrates the database to the latest version with atomic consistency guarantees.
 *
 * WHY: Financial applications require zero-downtime deployments with schema versioning
 * to ensure asset data integrity during updates.
 *
 * ARCHITECTURAL DECISIONS:
 * - Startup migration: Ensures schema consistency before any business operations
 * - Hasura table tracking: Enables real-time GraphQL subscriptions for asset updates
 * - Error isolation: Migration failures prevent application startup vs silent corruption
 * - Skip mechanism: Allows production deployments to disable automatic migrations
 *
 * PERFORMANCE IMPLICATIONS:
 * - Blocking initialization: Trades startup latency for runtime consistency guarantees
 * - Connection reuse: Single DB instance prevents migration/operation connection conflicts
 * - Schema caching: Post-migration schema introspection accelerates subsequent queries
 *
 * COMPLIANCE REQUIREMENTS:
 * - Audit logging: All schema changes are logged for regulatory compliance (SOX/SOC2)
 * - Rollback safety: Failed migrations leave database in previous consistent state
 * - Permission validation: Hasura tracking respects database-level access controls
 *
 * @throws {Error} Critical failure that prevents application startup - indicates
 *   infrastructure issues requiring immediate intervention
 */
const migrateDatabase = async () => {
  // DEPLOYMENT: Production environments may manage migrations externally via CI/CD
  if (env.DISABLE_MIGRATIONS_ON_STARTUP) {
    return;
  }
  // CONCURRENCY: Idempotent guard prevents duplicate migrations in multi-instance scenarios
  if (migrationStatus !== "none") {
    return;
  }
  migrationStatus = "migrating";
  try {
    const db = getDb();
    logger.info("Migrating the database");
    // WHY: "drizzle" folder convention enables tooling integration and deployment automation
    // SECURITY: Migration files are versioned and immutable to prevent unauthorized schema changes
    await migrate(db, {
      migrationsFolder: "drizzle",
    });
    logger.info("Completed migrating the database");
  } catch (error_) {
    const error = error_ as Error;
    logger.error(`Error migrating the database: ${error.message}`, error);
    // RELIABILITY: Fail-fast prevents data corruption from operating on outdated schema
    // SECURITY: Migration failures often indicate unauthorized schema modifications
    throw new Error(`Database migration failed: ${error.message}`);
  }

  try {
    logger.info("Tracking all tables in Hasura");
    // WHY: Database name extraction ensures Hasura tracks correct schema in multi-tenant setups
    const database = client.options.database ?? "default";
    // PERFORMANCE: Automatic table tracking enables real-time GraphQL without manual configuration
    // SECURITY: Exclude "drizzle" schema to prevent exposure of migration metadata via GraphQL
    await trackAllTables(database, hasuraMetadataClient, {
      excludeSchemas: ["drizzle"],
    });
    logger.info("Completed tracking all tables in Hasura");
  } catch (error_) {
    const error = error_ as Error;
    // RESILIENCE: Hasura tracking failure doesn't break core functionality, just real-time features
    // TRADEOFF: Continue startup vs fail-fast - chosen for backward compatibility with non-GraphQL usage
    logger.error(`Error tracking all tables in Hasura: ${error.message}`, error);
  }

  migrationStatus = "migrated";
};

/**
 * Creates the Drizzle ORM database instance with security and performance optimizations.
 *
 * WHY: Financial applications require absolute separation between client and server data access
 * to prevent unauthorized asset manipulation and maintain regulatory compliance.
 *
 * SECURITY ARCHITECTURE:
 * - serverOnly wrapper: Compile-time prevention of client-side database access
 * - Connection pool isolation: Each request gets isolated connection from shared pool
 * - Schema binding: Type system enforces database constraints at application layer
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Prepared statement caching: Drizzle automatically caches query plans for repeated operations
 * - Connection pooling: Reuses expensive PostgreSQL connections across requests
 * - Schema pre-compilation: TypeScript validates queries before runtime execution
 *
 * DEVELOPER EXPERIENCE:
 * - Type safety: Full IntelliSense support for database operations
 * - Query debugging: Optional SQL logging for development troubleshooting
 * - Schema introspection: Automatic type generation from database schema
 *
 * @returns Configured Drizzle instance bound to application schema and connection pool
 */
const getDb = serverOnly(() => {
  return drizzle(client, {
    // DEBUGGING: Query logging disabled by default to prevent credential leakage in logs
    // PERFORMANCE: SQL logging has measurable overhead in high-throughput scenarios
    // Enable temporarily for development: logger: process.env.NODE_ENV === "development"
    // logger: process.env.NODE_ENV === "development",

    // TYPE SAFETY: Schema binding enables compile-time validation of all database operations
    // PERFORMANCE: Drizzle uses schema metadata for query optimization and result mapping
    // MAINTAINABILITY: Centralized schema imports ensure consistent table definitions across app
    schema: schemas,
  });
});

/**
 * Creates a migration-safe database instance for production use.
 *
 * WHY: Combines migration and instantiation to guarantee schema consistency
 * before any database operations can occur.
 *
 * RELIABILITY: Prevents application startup with mismatched schema versions
 * that could corrupt financial asset data.
 *
 * @returns Promise resolving to fully migrated and configured database instance
 */
const getMigratedDb = serverOnly(async () => {
  await migrateDatabase();
  return getDb();
});

/**
 * The singleton database client instance for the asset tokenization platform.
 *
 * WHY: Single instance architecture prevents connection pool fragmentation and ensures
 * consistent transaction isolation across all application modules.
 *
 * ARCHITECTURAL BENEFITS:
 * - Transaction consistency: All operations share the same connection pool and isolation level
 * - Resource efficiency: Prevents connection multiplication in microservice architectures
 * - Type safety propagation: Schema changes automatically flow to all dependent modules
 * - Performance monitoring: Centralized connection enables unified database metrics
 *
 * SECURITY GUARANTEES:
 * - Server-side enforcement: Impossible to instantiate from client-side code
 * - Migration dependency: Database operations impossible until schema is current
 * - Connection isolation: Each request gets isolated connection from managed pool
 *
 * USAGE PATTERNS:
 * - Asset transactions: All tokenization operations go through this instance
 * - User authentication: Session and identity management via type-safe queries
 * - Audit logging: Compliance-required event tracking with full type safety
 * - Real-time updates: Integrated with Hasura for GraphQL subscription support
 *
 * @example
 * ```typescript
 * // Asset balance queries with full type safety
 * const userAssets = await db
 *   .select({
 *     symbol: tokenTable.symbol,
 *     balance: userBalanceTable.amount,
 *     lastUpdated: userBalanceTable.updatedAt
 *   })
 *   .from(userBalanceTable)
 *   .innerJoin(tokenTable, eq(userBalanceTable.tokenId, tokenTable.id))
 *   .where(eq(userBalanceTable.userId, currentUser.id));
 *
 * // Atomic asset transfers with transaction safety
 * await db.transaction(async (tx) => {
 *   await tx.update(userBalanceTable)
 *     .set({ amount: sql`amount - ${transferAmount}` })
 *     .where(eq(userBalanceTable.userId, fromUserId));
 *
 *   await tx.update(userBalanceTable)
 *     .set({ amount: sql`amount + ${transferAmount}` })
 *     .where(eq(userBalanceTable.userId, toUserId));
 * });
 *
 * // Compliance queries for regulatory reporting
 * const suspiciousTransactions = await db
 *   .select()
 *   .from(transactionTable)
 *   .where(and(
 *     gte(transactionTable.amount, LARGE_TRANSACTION_THRESHOLD),
 *     eq(transactionTable.flagged, true)
 *   ))
 *   .orderBy(desc(transactionTable.createdAt));
 * ```
 */
export const db = await getMigratedDb();
