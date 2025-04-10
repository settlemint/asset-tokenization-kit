import { date, index, numeric, pgTable, text } from "drizzle-orm/pg-core";

export const exchangeRate = pgTable(
  "exchange_rate",
  {
    id: text("id").primaryKey(), // Format: "USD-EUR"
    baseCurrency: text("base_currency").notNull(),
    quoteCurrency: text("quote_currency").notNull(),
    rate: numeric("rate").notNull(),
    day: date("day").notNull(),
  },
  (table) => [
    index("exchange_rate_base_currency_idx").on(table.baseCurrency),
    index("exchange_rate_quote_currency_idx").on(table.quoteCurrency),
    index("exchange_rate_day_idx").on(table.day),
  ]
);
