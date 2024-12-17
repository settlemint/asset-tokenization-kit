import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

function validateEnvVariables() {
  const required = {
    databaseUrl: process.env.SETTLEMINT_HASURA_DATABASE_URL,
    password: process.env.SETTLEMINT_HASURA_DATABASE_PASSWORD,
    user: process.env.SETTLEMINT_HASURA_DATABASE_USER,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return required as { [K in keyof typeof required]: string };
}

const env = validateEnvVariables();

const pool = new Pool({
  connectionString: env.databaseUrl,
  password: env.password,
  user: env.user,
});

export const db = drizzle({ client: pool });
