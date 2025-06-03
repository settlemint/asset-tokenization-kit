import { auth } from "@/lib/auth/auth";
import type { db } from "@/lib/db";

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
export type Context = {
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
  headers: Headers;

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
  auth?: Awaited<ReturnType<typeof auth.api.getSession>>;

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
};
