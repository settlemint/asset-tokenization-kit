import { drizzle } from "drizzle-orm/node-postgres";
import { postgresPool } from "../settlemint/postgres";
import * as assetTokenizationSchema from "./schema-asset-tokenization";
import * as authSchema from "./schema-auth";
import * as settingsSchema from "./schema-settings";
export const db = drizzle(postgresPool, {
  // logger: process.env.NODE_ENV === 'development',
  schema: {
    ...authSchema,
    ...assetTokenizationSchema,
    ...settingsSchema,
  },
});
