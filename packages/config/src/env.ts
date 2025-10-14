import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

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

    SETTLEMINT_LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error"])
      .default("info"),

    SETTLEMINT_INSTANCE: z.string().optional(),

    SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT: z.url(),

    /**
     * Don't run database migrations on startup
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

    VITE_SETTLEMINT_LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error"])
      .default("info"),
  },

  /**
   * Runtime environment variable mappings.
   *
   * This object maps the schema fields to the actual process.env values.
   * It's required by t3-env to properly access environment variables at runtime.
   * All environment variables must be explicitly mapped here.
   */
  runtimeEnv: process.env,

  /**
   * Skip validation flag.
   *
   * When set to true (via SKIP_ENV_VALIDATION=true), t3-env will skip
   * all validation checks. This is useful in CI/CD environments where
   * environment variables might not be available during the build step.
   * @default false
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Empty string handling.
   *
   * When true, t3-env treats empty strings as undefined values.
   * This is useful for environment variables that might be set to
   * empty strings in certain deployment environments.
   * @default true
   */
  emptyStringAsUndefined: true,
});
