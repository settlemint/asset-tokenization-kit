/**
 * Error thrown when required environment variables are missing
 */
class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

const REQUIRED_ENV_VARS = [
  'SETTLEMINT_HASURA_ADMIN_SECRET',
  'SETTLEMINT_HD_PRIVATE_KEY',
] as const;

/**
 * Validates that all required environment variables are present
 * @throws {EnvironmentError} If any required environment variable is missing
 */
export function validateEnvironmentVariables(): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new EnvironmentError(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
