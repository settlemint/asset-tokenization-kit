import { safeParse } from "@/lib/utils/zod";
import { z } from "zod";

/**
 * Server-side environment variable schema.
 * 
 * This schema defines and validates all server-side environment variables required
 * by the application. It ensures type safety and provides runtime validation for
 * critical configuration values that should not be exposed to the client.
 * 
 * @remarks
 * These variables are only accessible on the server and contain sensitive
 * information like API keys, secrets, and internal service URLs.
 */
const serverEnvironmentSchema = z.object({
  BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  SETTLEMINT_HASURA_ADMIN_SECRET: z
    .string()
    .min(1, "SETTLEMINT_HASURA_ADMIN_SECRET is required"),
  RESEND_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Wallet related
  SETTLEMINT_HD_PRIVATE_KEY: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "SETTLEMINT_HD_PRIVATE_KEY can only contain lowercase letters, digits, and hyphens with no spaces"
    )
    .default("atk-hd-private-key"),
  // Define APP_URL as part of the schema with a default value
  APP_URL: z.string().url(),
});

/**
 * Inferred TypeScript type for server environment variables.
 * Provides type-safe access to validated server configuration.
 */
type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

/**
 * Client-side environment variable schema.
 * 
 * This schema defines environment variables that are safe to expose to the client.
 * These variables are prefixed with NEXT_PUBLIC_ and are bundled into the client code.
 * 
 * @remarks
 * Only include non-sensitive configuration that can be safely exposed in browser code.
 */
const clientEnvironmentSchema = z.object({
  NEXT_PUBLIC_EXPLORER_URL: z.string().url().optional(),
});

/**
 * Inferred TypeScript type for client environment variables.
 * Provides type-safe access to validated client configuration.
 */
type ClientEnvironment = z.infer<typeof clientEnvironmentSchema>;

/**
 * Validates and returns typed server environment variables.
 * 
 * This function retrieves and validates all server-side environment variables,
 * applying fallback logic for APP_URL to ensure compatibility with different
 * authentication configurations.
 * 
 * @returns Validated server environment configuration
 * @throws {ZodError} If required environment variables are missing or invalid
 * 
 * @example
 * ```typescript
 * const env = getServerEnvironment();
 * console.log(env.SETTLEMINT_HASURA_ADMIN_SECRET); // Type-safe access
 * ```
 */
export function getServerEnvironment(): ServerEnvironment {
  // Add the APP_URL property with fallbacks for backward compatibility
  return safeParse(serverEnvironmentSchema, {
    ...process.env,
    APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.BETTER_AUTH_URL ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3000",
  });
}

/**
 * Validates and returns typed client environment variables.
 * 
 * This function retrieves and validates client-side environment variables
 * that are safe to expose in the browser. These are typically prefixed
 * with NEXT_PUBLIC_ in Next.js applications.
 * 
 * @returns Validated client environment configuration
 * @throws {ZodError} If environment variables are invalid
 * 
 * @example
 * ```typescript
 * const env = getClientEnvironment();
 * console.log(env.NEXT_PUBLIC_EXPLORER_URL); // Safe to use in browser
 * ```
 */
export function getClientEnvironment(): ClientEnvironment {
  return safeParse(clientEnvironmentSchema, process.env);
}
