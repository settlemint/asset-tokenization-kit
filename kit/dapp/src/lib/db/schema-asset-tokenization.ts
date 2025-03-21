import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./schema-auth";

export const asset = pgTable("asset", {
  id: text("id").primaryKey(),
  isin: text("isin"),
  valueInBaseCurrency: numeric("value_in_base_currency", {
    precision: 36,
    scale: 18,
  }),
});

export const contact = pgTable("contact", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  wallet: text("wallet").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
