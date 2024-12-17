import { createDrizzleClient } from '@settlemint/sdk-hasura';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const db: NodePgDatabase = createDrizzleClient({
  databaseUrl: process.env.SETTLEMINT_HASURA_DATABASE_URL ?? '',
  maxPoolSize: Number(process.env.SETTLEMINT_HASURA_DATABASE_MAX_POOL_SIZE),
  idleTimeoutMillis: Number(process.env.SETTLEMINT_HASURA_DATABASE_IDLE_TIMEOUT),
  connectionTimeoutMillis: Number(process.env.SETTLEMINT_HASURA_DATABASE_CONNECTION_TIMEOUT),
  maxRetries: Number(process.env.SETTLEMINT_HASURA_DATABASE_MAX_RETRIES),
  retryDelayMs: Number(process.env.SETTLEMINT_HASURA_DATABASE_RETRY_DELAY),
});
