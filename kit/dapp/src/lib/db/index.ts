import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SETTLEMINT_HASURA_DATABASE_URL!,
  password: process.env.SETTLEMINT_HASURA_DATABASE_PASSWORD!,
  user: process.env.SETTLEMINT_HASURA_DATABASE_USER!,
});

export const db = drizzle({ client: pool });
