import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const redemptions = pgTable(
  "redemptions",
  {
    id: text("id").primaryKey(), // Format: "event id from the graph",
    processedDate: timestamp("processed_date", { withTimezone: true }),
  },
  (table) => [index("redemptions_processedDate_idx").on(table.processedDate)]
);
