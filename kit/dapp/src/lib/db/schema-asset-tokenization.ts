import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { fiatCurrencies } from "../utils/typebox/fiat-currency";
import { user } from "./schema-auth";

export const asset = pgTable("asset", {
  id: text("id").primaryKey(),
  isin: text("isin"),
});

export const currencyEnum = pgEnum("currency", fiatCurrencies);

export const assetPrice = pgTable("asset_price", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: text("asset_id")
    .notNull()
    .references(() => asset.id),
  amount: numeric("amount", {
    precision: 36,
    scale: 18,
  }),
  currency: currencyEnum("currency").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
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
