import type { Session, SessionUser } from "@/lib/auth";
import type { db } from "@/lib/db";
import type { hasuraClient } from "@/lib/settlemint/hasura";
import type { client as minioClient } from "@/lib/settlemint/minio";
import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import type { ValidatedTheGraphClient } from "@/orpc/middlewares/services/the-graph.middleware";
import type { System } from "@/orpc/routes/system/routes/system.read.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { EthereumAddress } from "@atk/zod/ethereum-address";
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
   * @see {@link @/lib/db} - Database configuration and connection
   */
  db?: typeof db;

  /**
   * The Graph client instance for querying blockchain data.
   *
   * This is a validated wrapper around the base The Graph client that enforces
   * runtime type safety through Zod schema validation. The ValidatedTheGraphClient
   * type ensures that:
   * - All query results are validated against provided Zod schemas
   * - Type inference works seamlessly from schema to result type
   * - Runtime errors are caught early with descriptive validation messages
   * - The client maintains full compatibility with the underlying GraphQL operations
   *
   * Injected by theGraphMiddleware when a procedure requires blockchain data access.
   * @optional - Only available in procedures that use theGraphMiddleware
   * @see {@link @/orpc/middlewares/services/the-graph.middleware} - The Graph middleware implementation
   * @see {@link ValidatedTheGraphClient} - Type definition with validation methods
   */
  theGraphClient?: ValidatedTheGraphClient;

  /**
   * Portal client instance for interacting with the SettleMint Portal API.
   *
   * This validated client wrapper enhances the base Portal client with automatic
   * validation and type safety features. The ValidatedPortalClient type provides:
   * - Automatic transaction hash extraction and validation for mutations
   * - Required Zod schema validation for all query operations
   * - Type-safe error handling with descriptive validation messages
   * - Seamless integration with the Portal GraphQL schema
   *
   * The validation layer ensures that:
   * - Mutation results containing transaction hashes are properly typed
   * - Query results match expected schemas at runtime
   * - Invalid API responses are caught before they can cause downstream errors
   *
   * Injected by portalMiddleware when a procedure needs Portal API access.
   * @optional - Only available in procedures that use portalMiddleware
   * @see {@link @/orpc/middlewares/services/portal.middleware} - Portal middleware implementation
   * @see {@link ValidatedPortalClient} - Type definition with validation methods
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

  /**
   * System information.
   * Injected by systemMiddleware for procedures that need to interact with the system.
   * @optional
   * @see {@link @/lib/settlemint/system} - System client configuration
   */
  system?: System;

  /**
   * Token information.
   * Injected by tokenMiddleware for procedures that need to interact with a specific token.
   * @optional
   * @see {@link @/orpc/middlewares/system/token.middleware} - Token middleware configuration
   */
  token?: Token;

  /**
   * User identity and claims.
   * Injected by userClaimsMiddleware for procedures that need to access the user's identity contract and claims.
   * @optional
   * @see {@link @/orpc/middlewares/system/user-identity.middleware} - User identity middleware configuration
   */
  userIdentity?: {
    address?: EthereumAddress;
    claims: string[];
  };

  /**
   * Claim topics the authenticated user is authorized to issue as a trusted issuer.
   * Injected by trustedIssuerMiddleware for procedures that need issuer authorization.
   * Contains topic names (e.g., ["kyc", "aml"]) that the user can verify/issue for others.
   * Empty array if user is not a trusted issuer for any topics.
   * @optional
   * @see {@link @/orpc/middlewares/auth/trusted-issuer.middleware} - Trusted issuer middleware configuration
   */
  userTrustedIssuerTopics?: string[];

  /**
   * The issuer's identity contract address when the user is a trusted issuer.
   * Injected by trustedIssuerMiddleware alongside userTrustedIssuerTopics.
   * @optional
   */
  userIssuerIdentity?: EthereumAddress;
}
