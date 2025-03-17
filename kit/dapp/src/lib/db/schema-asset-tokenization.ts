import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const asset = pgTable("asset", {
  id: text("id").primaryKey(),
  isin: text("isin"),
  valueCurrency: text("value_currency").notNull().default("EUR"),
  value: numeric("value").notNull().default("1"),
});

export const exchangeRate = pgTable("exchange_rate", {
  id: uuid("id").defaultRandom().primaryKey(),
  baseCurrency: text("base_currency").notNull(),
  quoteCurrency: text("quote_currency").notNull(),
  rate: numeric("rate").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});
