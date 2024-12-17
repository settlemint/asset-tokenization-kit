import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { z } from 'zod';

/**
 * Schema for database configuration environment variables
 */
const envSchema = z.object({
  databaseUrl: z.string().url().min(1),
  password: z.string().min(1),
  user: z.string().min(1),
  maxPoolSize: z.coerce.number().int().positive().default(20),
  idleTimeoutMillis: z.coerce.number().int().positive().default(30000),
  connectionTimeoutMillis: z.coerce.number().int().positive().default(5000),
});

const env = envSchema.parse({
  databaseUrl: process.env.SETTLEMINT_HASURA_DATABASE_URL,
  password: process.env.SETTLEMINT_HASURA_DATABASE_PASSWORD,
  user: process.env.SETTLEMINT_HASURA_DATABASE_USER,
  maxPoolSize: process.env.SETTLEMINT_HASURA_DATABASE_MAX_POOL_SIZE,
  idleTimeoutMillis: process.env.SETTLEMINT_HASURA_DATABASE_IDLE_TIMEOUT,
  connectionTimeoutMillis: process.env.SETTLEMINT_HASURA_DATABASE_CONNECTION_TIMEOUT,
});

const pool = new Pool({
  connectionString: env.databaseUrl,
  password: env.password,
  user: env.user,
  max: env.maxPoolSize,
  idleTimeoutMillis: env.idleTimeoutMillis,
  connectionTimeoutMillis: env.connectionTimeoutMillis,
});

// Handle pool errors
pool.on('error', (err) => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Handle connection errors
pool.on('connect', (client) => {
  client.on('error', (err) => {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error('Database client error:', err);
  });
});

export const db = drizzle({ client: pool });
