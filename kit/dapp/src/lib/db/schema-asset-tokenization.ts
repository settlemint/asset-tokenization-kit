import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const asset = pgTable("asset", {
  id: text("id").primaryKey(),
  isin: text("isin"),
});

export const contact = pgTable("contact", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  wallet: text("wallet").notNull(),
  name: text("name").notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }),
});
