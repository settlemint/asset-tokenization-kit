import { z } from "zod";

const environmentSchema = z.object({
  // Auth related
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  SETTLEMINT_HASURA_ADMIN_SECRET: z.string().min(1),
  SETTLEMINT_HASURA_DATABASE_URL: z.string().url(),
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

  // Explorer
  NEXT_PUBLIC_EXPLORER_URL: z.string().url().optional(),
});

type Environment = z.infer<typeof environmentSchema>;

/**
 * Validates and returns typed environment variables
 * @throws If environment variables are invalid
 */
export function getEnvironment(): Environment {
  return environmentSchema.parse(process.env);
}

/**
 * Use this to check if environment is properly configured at startup
 * @throws If environment variables are invalid
 */
export function validateEnvironment(): void {
  getEnvironment();
}
