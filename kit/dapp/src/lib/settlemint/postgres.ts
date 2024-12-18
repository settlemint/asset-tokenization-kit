import { createPostgresPool } from '@settlemint/sdk-hasura/postgres';

export const postgresPool = createPostgresPool(process.env.SETTLEMINT_HASURA_DATABASE_URL ?? '');
