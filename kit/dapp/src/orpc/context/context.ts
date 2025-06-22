import type { Session, SessionUser } from "@/lib/auth";
import type { db } from "@/lib/db";
import type { hasuraClient } from "@/lib/settlemint/hasura";
import type { client as minioClient } from "@/lib/settlemint/minio";
import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import type { ValidatedTheGraphClient } from "@/orpc/middlewares/services/the-graph.middleware";
import type { getHeaders } from "@tanstack/react-start/server";

/**
 * ORPC procedure context type definition.
 *
 * This type defines the context object that is available to all ORPC procedures,
 * providing access to essential services and request information. The context
 * is created for each request and passed to every procedure, enabling them to
 * access authentication state, database connections, and request metadata.
 *
 * The context follows a dependency injection pattern, making procedures
 * testable and allowing for different implementations in different environments
 * (e.g., testing vs production).
 */
export interface Context {
  /**
   * HTTP request headers.
   *
   * Contains all headers from the incoming HTTP request, including:
   * - Authentication tokens (Authorization, Cookie headers)
   * - Content negotiation headers (Accept, Content-Type)
   * - CSRF protection tokens
   * - Custom application headers
   *
   * These headers are essential for authentication, content negotiation,
   * and maintaining request context across procedure calls.
   */
  headers: ReturnType<typeof getHeaders>;

  /**
   * Authentication session information.
   *
   * Contains the current user's authentication state if they are logged in.
   * This includes user identity, permissions, session metadata, and any
   * other authentication-related data provided by the auth system.
   *
   * Optional because not all procedures require authentication, and
   * unauthenticated requests will have this as undefined.
   *
   * @see {@link @/lib/auth/auth} - Authentication system implementation
   */
  auth?: {
    user: SessionUser;
    session: Session;
  };

  /**
   * Database connection instance.
   *
   * Provides access to the application's database through the configured
   * ORM/query builder. This allows procedures to perform database operations
   * such as querying, inserting, updating, and deleting data.
   *
   * Optional to support procedures that don't need database access,
   * such as utility functions or external API integrations.
   *
   * @see {@link @/lib/db} - Database configuration and connection
   */
  db?: typeof db;

  /**
   * The Graph client instance for querying blockchain data.
   * Injected by theGraphMiddleware with built-in validation for all queries.
   * All queries require Zod schema validation.
   * @optional
   * @see {@link @/orpc/middlewares/services/the-graph.middleware} - The Graph middleware
   */
  theGraphClient?: ValidatedTheGraphClient;

  /**
   * Portal client instance for interacting with the SettleMint Portal API.
   * Injected by portalMiddleware with built-in validation:
   * - Mutations automatically extract and validate transaction hashes
   * - Queries require Zod schema validation
   * @optional
   * @see {@link @/orpc/middlewares/services/portal.middleware} - Portal middleware
   */
  portalClient?: ValidatedPortalClient;

  /**
   * MinIO client instance for object storage operations.
   * Injected by minioMiddleware for procedures that need to store/retrieve files.
   * @optional
   * @see {@link @/lib/settlemint/minio} - MinIO client configuration
   */
  minioClient?: typeof minioClient;

  /**
   * Hasura GraphQL client instance for querying and mutating data.
   * Injected by hasuraMiddleware for procedures that need to interact with Hasura.
   * @optional
   * @see {@link @/lib/settlemint/hasura} - Hasura client configuration
   */
  hasuraClient?: typeof hasuraClient;
}
