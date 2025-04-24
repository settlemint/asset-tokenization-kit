import {
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { fiatCurrencies } from "../utils/typebox/fiat-currency";
import { user } from "./schema-auth";

export const asset = pgTable(
  "asset",
  {
    id: text("id").primaryKey(),
    isin: text("isin"),
  },
  (table) => [index("asset_isin_idx").on(table.isin)]
);

export const currencyEnum = pgEnum("currency", fiatCurrencies);

export const assetPrice = pgTable(
  "asset_price",
  {
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
  },
  (table) => [index("asset_price_asset_id_idx").on(table.assetId)]
);

export const contact = pgTable(
  "contact",
  {
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
  },
  (table) => [
    index("contact_name_idx").on(table.name),
    index("contact_wallet_idx").on(table.wallet),
    index("contact_user_id_idx").on(table.userId),
  ]
);

export const actions = pgTable("actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: text("asset_id")
    .notNull()
    .references(() => asset.id),
  actionType: text("action_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
