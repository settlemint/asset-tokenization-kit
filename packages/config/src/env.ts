import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Environment configuration using t3-env for type-safe environment variables.
 *
 * This module provides runtime validation and type safety for environment variables
 * using the @t3-oss/env-core library. It ensures that all required environment
 * variables are present and correctly typed at build time, preventing runtime errors.
 *
 * Key features:
 * - Build-time validation of environment variables
 * - Type-safe access to env vars throughout the codebase
 * - Clear separation between server and client variables
 * - Automatic handling of empty strings as undefined
 * - Support for skipping validation in CI/CD environments
 * @example
 * ```typescript
 * // Direct usage (recommended)
 * import { env } from '@/lib/config/env';
 * console.log(env.SETTLEMINT_HASURA_ADMIN_SECRET);

 * ```
 * @see https://env.t3.gg/docs/introduction
 * @module
 */
export const env = createEnv({
  clientPrefix: "VITE_",
  /**
   * Server-side environment variables schema.
   *
   * These variables are only available on the server and typically contain
   * sensitive information like API keys, secrets, and OAuth credentials.
   * They are never exposed to the client bundle.
   * @private
   */
  server: {
    /**
     * Authentication URLs used by Better Auth.
     * These define the base URLs for authentication callbacks and redirects.
     */
    BETTER_AUTH_URL: z.url().optional(),
    NEXTAUTH_URL: z.url().optional(),

    /**
     * Application base URL with intelligent fallback.
     * Priority: NEXT_PUBLIC_APP_URL > BETTER_AUTH_URL > NEXTAUTH_URL > localhost
     */
    APP_URL: z
      .url()
      .default(
        process.env.VITE_APP_URL ??
          process.env.BETTER_AUTH_URL ??
          process.env.NEXTAUTH_URL ??
          "http://localhost:3000"
      ),

    /**
     * Hasura GraphQL admin secret.
     * Required for server-side GraphQL operations with admin privileges.
     * @required
     */
    SETTLEMINT_HASURA_ADMIN_SECRET: z
      .string()
      .nonempty("SETTLEMINT_HASURA_ADMIN_SECRET is required"),

    /**
     * HD wallet private key identifier.
     * Used for deterministic key generation in the SettleMint platform.
     * Must contain only lowercase letters, numbers, and hyphens.
     * @default "atk-hd-private-key"
     */
    SETTLEMINT_HD_PRIVATE_KEY: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        "SETTLEMINT_HD_PRIVATE_KEY can only contain lowercase letters, digits, and hyphens with no spaces"
      )
      .default("atk-hd-private-key"),

    /**
     * Server-side logging level configuration.
     *
     * WHY: Controls verbosity of server-side logs for observability and debugging.
     * PERFORMANCE: Higher log levels (debug) can impact performance in production.
     * SECURITY: Debug logs may contain sensitive information - use carefully.
     * @default "info"
     */
    SETTLEMINT_LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error"])
      .default("info"),

    /**
     * SettleMint platform instance identifier.
     *
     * WHY: Optional identifier for multi-tenant deployments or environment separation.
     * DEPLOYMENT: Helps distinguish between different platform instances in logs/metrics.
     */
    SETTLEMINT_INSTANCE: z.string().optional(),

    /**
     * Blockchain node JSON-RPC endpoint URL.
     *
     * WHY: Critical connection point for all blockchain operations.
     * SECURITY: Must be a trusted RPC endpoint to prevent transaction manipulation.
     * PERFORMANCE: Latency to this endpoint affects all blockchain interactions.
     * PROTOCOLS: Supports HTTP/HTTPS/WS/WSS for different connection types.
     * @required
     */
    SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: z.url(),

    /**
     * Database migration control flag.
     *
     * WHY: Prevents automatic migrations during container startup in production.
     * DEPLOYMENT: Allows manual control over schema changes in sensitive environments.
     * TRADEOFF: Convenience vs deployment safety - defaults to safe (false).
     * @default false
     */
    DISABLE_MIGRATIONS_ON_STARTUP: z.coerce.boolean().default(false),
  },

  /**
   * Client-side environment variables schema.
   *
   * These variables are exposed to the browser bundle and must be prefixed
   * with NEXT_PUBLIC_ for Next.js to include them in the client build.
   * Never put sensitive information in these variables.
   * @public
   */
  client: {
    /**
     * Public application URL.
     * Used for generating absolute URLs in client-side code.
     */
    VITE_APP_URL: z
      .url()
      .default(
        process.env.VITE_APP_URL ??
          process.env.BETTER_AUTH_URL ??
          process.env.NEXTAUTH_URL ??
          "http://localhost:3000"
      ),

    /**
     * Blockchain explorer URL.
     * Used for generating links to transactions and addresses.
     */
    VITE_EXPLORER_URL: z.url().optional(),

    /**
     * Client-side logging level configuration.
     *
     * WHY: Controls browser console log verbosity separate from server logs.
     * SECURITY: Debug logs in browser may expose sensitive client-side data.
     * PERFORMANCE: Excessive client logging can impact browser performance.
     * DEBUGGING: Essential for troubleshooting client-side issues in production.
     * @default "info"
     */
    VITE_SETTLEMINT_LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error"])
      .default("info"),
  },

  /**
   * Runtime environment variable mappings.
   *
   * WHY: t3-env requires explicit mapping to access process.env at runtime.
   * SECURITY: Only explicitly mapped variables are accessible, preventing accidental exposure.
   * PERFORMANCE: Direct process.env access is optimized compared to individual property lookups.
   * INVARIANT: All schema fields must have corresponding process.env mapping.
   */
  runtimeEnv: process.env,

  /**
   * Validation bypass control.
   *
   * WHY: CI/CD environments often need to build without full environment context.
   * TRADEOFF: Build flexibility vs runtime safety - use sparingly.
   * DEPLOYMENT: Allows container builds to complete without env vars, which are injected later.
   * SECURITY: Bypasses all validation - ensure runtime environment is properly configured.
   * @default false
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Empty string normalization.
   *
   * WHY: Deployment platforms (Docker, K8s) often set env vars to empty strings.
   * CONSISTENCY: Normalizes empty strings to undefined for consistent optional behavior.
   * TRADEOFF: Convenience vs explicit control - prevents "empty but present" edge cases.
   * BEHAVIOR: Empty strings trigger default values and optional handling.
   * @default true
   */
  emptyStringAsUndefined: true,
});
