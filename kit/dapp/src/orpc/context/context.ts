import type { Session, SessionUser } from "@/lib/auth";
import type { db } from "@/lib/db";
import type { hasuraClient } from "@/lib/settlemint/hasura";
import type { client as minioClient } from "@/lib/settlemint/minio";
import type { portalClient } from "@/lib/settlemint/portal";
import type { theGraphClient } from "@/lib/settlemint/the-graph";
import type { TokenFactory } from "@/orpc/middlewares/system/system.middleware";
import type { Token } from "@/orpc/middlewares/system/token.middleware";
import type { getHeaders } from "@tanstack/react-start/server";
import type { Address } from "viem";

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
   * Injected by theGraphMiddleware for procedures that need to query indexed blockchain events.
   * @optional
   * @see {@link @/lib/settlemint/the-graph} - The Graph client configuration
   */
  theGraphClient?: typeof theGraphClient;

  /**
   * Portal client instance for interacting with the SettleMint Portal API.
   * Injected by portalMiddleware for procedures that need to interact with Portal services.
   * @optional
   * @see {@link @/lib/settlemint/portal} - Portal client configuration
   */
  portalClient?: typeof portalClient;

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

  /**
   * System information.
   * Injected by systemMiddleware for procedures that need to interact with the system.
   * @optional
   * @see {@link @/lib/settlemint/system} - System client configuration
   */
  system?: {
    address: Address;
    tokenFactories: TokenFactory[];
  };

  /**
   * Token factory information.
   * Injected by tokenFactoryMiddleware for procedures that need to interact with a specific token factory.
   * @optional
   * @see {@link @/orpc/middlewares/system/token-factory.middleware} - Token factory middleware configuration
   */
  tokenFactory?: TokenFactory;

  /**
   * Token information.
   * Injected by tokenMiddleware for procedures that need to interact with a specific token.
   * @optional
   * @see {@link @/orpc/middlewares/system/token.middleware} - Token middleware configuration
   */
  token?: Token;
}
