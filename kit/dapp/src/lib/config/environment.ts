import { z } from "zod";

const environmentSchema = z.object({
  // Auth related
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  SETTLEMINT_HASURA_ADMIN_SECRET: z.string().min(1),

  // Wallet related
  SETTLEMINT_HD_PRIVATE_KEY: z.string().min(1),

  // Add other environment variables as needed
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
