import { postgresPool } from "@/lib/settlemint/postgres";
import { serverOnly } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schemas from "./schema";

const getDb = serverOnly(() =>
  drizzle(postgresPool, {
    logger: process.env.NODE_ENV === "development",
    schema: schemas,
  })
);

export const db = getDb();
