import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";

const serverEnvironmentSchema = t.Object(
  {
    BETTER_AUTH_URL: t.Optional(t.String({ format: "uri" })),
    NEXT_PUBLIC_APP_URL: t.Optional(t.String({ format: "uri" })),
    NEXTAUTH_URL: t.Optional(t.String({ format: "uri" })),
    SETTLEMINT_HASURA_ADMIN_SECRET: t.String({ minLength: 1 }),
    RESEND_API_KEY: t.Optional(t.String()),
    GOOGLE_CLIENT_ID: t.Optional(t.String()),
    GOOGLE_CLIENT_SECRET: t.Optional(t.String()),
    GITHUB_CLIENT_ID: t.Optional(t.String()),
    GITHUB_CLIENT_SECRET: t.Optional(t.String()),

    // Wallet related
    SETTLEMINT_HD_PRIVATE_KEY: t.String({
      pattern: "^[a-z0-9-]+$",
      error:
        "SETTLEMINT_HD_PRIVATE_KEY can only contain lowercase letters, digits, and hyphens with no spaces",
    }),

    // Define APP_URL as part of the schema with a default value
    APP_URL: t.Optional(t.String({ format: "uri" })),
  },
  { $id: "ServerEnvironment" }
);

type ServerEnvironment = StaticDecode<typeof serverEnvironmentSchema>;

const clientEnvironmentSchema = t.Object(
  {
    NEXT_PUBLIC_EXPLORER_URL: t.Optional(t.String({ format: "uri" })),
  },
  { $id: "ClientEnvironment" }
);

type ClientEnvironment = StaticDecode<typeof clientEnvironmentSchema>;

/**
 * Validates and returns typed environment variables
 * @throws If environment variables are invalid
 */
export function getServerEnvironment(): ServerEnvironment {
  const env = safeParse(serverEnvironmentSchema, process.env);

  // Add the APP_URL property with fallbacks
  return {
    ...env,
    APP_URL:
      env.NEXT_PUBLIC_APP_URL ??
      env.BETTER_AUTH_URL ??
      env.NEXTAUTH_URL ??
      "http://localhost:3000",
  };
}

export function getClientEnvironment(): ClientEnvironment {
  return safeParse(clientEnvironmentSchema, process.env);
}
