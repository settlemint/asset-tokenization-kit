import { date, numeric, pgTable, text } from "drizzle-orm/pg-core";

export const exchangeRate = pgTable("exchange_rate", {
  id: text("id").primaryKey(), // Format: "USD-EUR"
  baseCurrency: text("base_currency").notNull(),
  quoteCurrency: text("quote_currency").notNull(),
  rate: numeric("rate").notNull(),
  day: date("day").notNull(),
});
