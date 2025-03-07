import { z } from "zod";

const serverEnvironmentSchema = z
  .object({
    BETTER_AUTH_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXTAUTH_URL: z.string().url().optional(),
    SETTLEMINT_HASURA_ADMIN_SECRET: z.string().min(1),
    SETTLEMINT_HD_PRIVATE_KEY: z.string().min(1),
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

const clientEnvironmentSchema = z
  .object({
    NEXT_PUBLIC_EXPLORER_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  })
  .transform((env) => ({
    ...env,
    APP_URL: env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  }));

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
