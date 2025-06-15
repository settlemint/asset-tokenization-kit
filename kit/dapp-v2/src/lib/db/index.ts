import { postgresPool } from "@/lib/settlemint/postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schemas from "./schema";

export const db = drizzle(postgresPool, {
  logger: process.env.NODE_ENV === "development",
  schema: schemas,
});
