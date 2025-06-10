import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Environment configuration using t3-env for type-safe environment variables.
 * 
 * This module provides runtime validation and type safety for environment variables
 * using the @t3-oss/env-nextjs library. It ensures that all required environment
 * variables are present and correctly typed at build time, preventing runtime errors.
 * 
 * Key features:
 * - Build-time validation of environment variables
 * - Type-safe access to env vars throughout the codebase
 * - Clear separation between server and client variables
 * - Automatic handling of empty strings as undefined
 * - Support for skipping validation in CI/CD environments
 * 
 * @example
 * ```typescript
 * // Direct usage (recommended)
 * import { env } from '@/lib/config/env';
 * console.log(env.SETTLEMINT_HASURA_ADMIN_SECRET);
 * 
 * // Legacy usage (for backward compatibility)
 * import { getServerEnvironment } from '@/lib/config/env';
 * const serverEnv = getServerEnvironment();
 * ```
 * 
 * @see https://env.t3.gg/docs/introduction
 * @module
 */
export const env = createEnv({
  /**
   * Server-side environment variables schema.
   * 
   * These variables are only available on the server and typically contain
   * sensitive information like API keys, secrets, and OAuth credentials.
   * They are never exposed to the client bundle.
   * 
   * @private Server-only access
   */
  server: {
    /**
     * Authentication URLs used by Better Auth.
     * These define the base URLs for authentication callbacks and redirects.
     */
    BETTER_AUTH_URL: z.string().url().optional(),
    NEXTAUTH_URL: z.string().url().optional(),
    
    /**
     * Application base URL with intelligent fallback.
     * Priority: NEXT_PUBLIC_APP_URL > BETTER_AUTH_URL > NEXTAUTH_URL > localhost
     */
    APP_URL: z.string().url().default(
      process.env.NEXT_PUBLIC_APP_URL ??
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
      .min(1, "SETTLEMINT_HASURA_ADMIN_SECRET is required"),
    
    /**
     * Resend API key for email services.
     * Optional - if not provided, email functionality will be disabled.
     */
    RESEND_API_KEY: z.string().optional(),
    
    /**
     * OAuth provider credentials.
     * Configure these to enable social login functionality.
     */
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

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
  },

  /**
   * Client-side environment variables schema.
   * 
   * These variables are exposed to the browser bundle and must be prefixed
   * with NEXT_PUBLIC_ for Next.js to include them in the client build.
   * Never put sensitive information in these variables.
   * 
   * @public Browser-accessible
   */
  client: {
    /**
     * Public application URL.
     * Used for generating absolute URLs in client-side code.
     */
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    
    /**
     * Blockchain explorer URL.
     * Used for generating links to transactions and addresses.
     */
    NEXT_PUBLIC_EXPLORER_URL: z.string().url().optional(),
  },

  /**
   * Runtime environment variable mappings.
   * 
   * This object maps the schema fields to the actual process.env values.
   * It's required by t3-env to properly access environment variables at runtime.
   * All environment variables must be explicitly mapped here.
   */
  runtimeEnv: {
    // Server
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SETTLEMINT_HASURA_ADMIN_SECRET: process.env.SETTLEMINT_HASURA_ADMIN_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    SETTLEMINT_HD_PRIVATE_KEY: process.env.SETTLEMINT_HD_PRIVATE_KEY,
    
    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL,
  },

  /**
   * Skip validation flag.
   * 
   * When set to true (via SKIP_ENV_VALIDATION=true), t3-env will skip
   * all validation checks. This is useful in CI/CD environments where
   * environment variables might not be available during the build step.
   * 
   * @default false
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Empty string handling.
   * 
   * When true, t3-env treats empty strings as undefined values.
   * This is useful for environment variables that might be set to
   * empty strings in certain deployment environments.
   * 
   * @default true
   */
  emptyStringAsUndefined: true,
});

/**
 * Type representing all server-side environment variables.
 * Includes both server-only and client variables.
 * 
 * @deprecated Use `typeof env` directly instead
 */
export type ServerEnvironment = typeof env;

/**
 * Type representing only client-side environment variables.
 * Limited to variables prefixed with NEXT_PUBLIC_
 * 
 * @deprecated Use Pick<typeof env, "NEXT_PUBLIC_..."> directly
 */
export type ClientEnvironment = Pick<typeof env, 
  | "NEXT_PUBLIC_APP_URL" 
  | "NEXT_PUBLIC_EXPLORER_URL"
>;

/**
 * Get all server environment variables.
 * 
 * @deprecated Import `env` directly instead:
 * ```typescript
 * import { env } from '@/lib/config/env';
 * ```
 * 
 * @returns {ServerEnvironment} The complete environment object
 */
export function getServerEnvironment() {
  return env;
}

/**
 * Get only client-safe environment variables.
 * 
 * @deprecated Import `env` directly and access client vars:
 * ```typescript
 * import { env } from '@/lib/config/env';
 * const appUrl = env.NEXT_PUBLIC_APP_URL;
 * ```
 * 
 * @returns {ClientEnvironment} Object containing only client-safe variables
 */
export function getClientEnvironment() {
  return {
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_EXPLORER_URL: env.NEXT_PUBLIC_EXPLORER_URL,
  };
}