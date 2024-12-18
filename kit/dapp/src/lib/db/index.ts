import { drizzle } from 'drizzle-orm/node-postgres';
import { postgresPool } from '../settlemint/postgres';
import * as assetTokenizationSchema from './schema-asset-tokenization';
import * as authSchema from './schema-auth';

export const db = drizzle(postgresPool, {
  schema: {
    ...authSchema,
    ...assetTokenizationSchema,
  },
});
