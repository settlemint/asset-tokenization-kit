import { drizzleClient } from '../settlemint/drizzle';
import * as assetTokenizationSchema from './schema-asset-tokenization';
import * as authSchema from './schema-auth';

export const db = drizzleClient({
  schemas: {
    ...assetTokenizationSchema,
    ...authSchema,
  },
});
