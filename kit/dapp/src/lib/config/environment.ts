import { z } from "zod";

const serverEnvironmentSchema = z
  .object({
    BETTER_AUTH_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXTAUTH_URL: z.string().url().optional(),
    SETTLEMINT_HASURA_ADMIN_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // Wallet related
    SETTLEMINT_HD_PRIVATE_KEY: z.string().regex(/^[a-z0-9-]+$/, {
      message:
        "SETTLEMINT_HD_PRIVATE_KEY can only contain lowercase letters, digits, and hyphens with no spaces",
    }),
  })
  .transform((env) => ({
    ...env,
    APP_URL:
      env.NEXT_PUBLIC_APP_URL ??
      env.BETTER_AUTH_URL ??
      env.NEXTAUTH_URL ??
      "http://localhost:3000",
  }));

type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

const clientEnvironmentSchema = z.object({
  NEXT_PUBLIC_EXPLORER_URL: z.string().url().optional(),
});

type ClientEnvironment = z.infer<typeof clientEnvironmentSchema>;

/**
 * Validates and returns typed environment variables
 * @throws If environment variables are invalid
 */
export function getServerEnvironment(): ServerEnvironment {
  return serverEnvironmentSchema.parse(process.env);
}

export function getClientEnvironment(): ClientEnvironment {
  return clientEnvironmentSchema.parse(process.env);
}
