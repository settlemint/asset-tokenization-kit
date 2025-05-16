import { drizzle } from "drizzle-orm/node-postgres";
import { postgresPool } from "../settlemint/postgres";
import * as regulationConfigsSchema from "./regulations/schema-base-regulation-configs";
import * as micaRegulationConfigsSchema from "./regulations/schema-mica-regulation-configs";
import * as applicationSetupSchema from "./schema-application-setup";
import * as assetTokenizationSchema from "./schema-assets";
import * as authSchema from "./schema-auth";
import * as exchangeRatesSchema from "./schema-exchange-rates";
import * as settingsSchema from "./schema-settings";

export const db = drizzle(postgresPool, {
  // logger: process.env.NODE_ENV === 'development',
  schema: {
    ...authSchema,
    ...assetTokenizationSchema,
    ...settingsSchema,
    ...exchangeRatesSchema,
    ...regulationConfigsSchema,
    ...micaRegulationConfigsSchema,
    ...applicationSetupSchema,
  },
});
