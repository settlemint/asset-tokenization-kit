import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

/**
 * Table to track the application setup process
 */
export const applicationSetup = pgTable("application_setup", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  failedAt: timestamp("failed_at"),
  failedReason: text("failed_reason"),
});
