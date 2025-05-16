import { drizzle } from "drizzle-orm/node-postgres";
import { cache } from "react";
import { postgresPool } from "../settlemint/postgres";
import * as regulationConfigsSchema from "./regulations/schema-base-regulation-configs";
import * as micaRegulationConfigsSchema from "./regulations/schema-mica-regulation-configs";
import * as assetTokenizationSchema from "./schema-assets";
import * as authSchema from "./schema-auth";
import * as exchangeRatesSchema from "./schema-exchange-rates";
import * as settingsSchema from "./schema-settings";

const getDb = cache(() => {
  return drizzle(postgresPool, {
    // logger: process.env.NODE_ENV === 'development',
    schema: {
      ...authSchema,
      ...assetTokenizationSchema,
      ...settingsSchema,
      ...exchangeRatesSchema,
      ...regulationConfigsSchema,
      ...micaRegulationConfigsSchema,
    },
  });
});

export const db = getDb();
