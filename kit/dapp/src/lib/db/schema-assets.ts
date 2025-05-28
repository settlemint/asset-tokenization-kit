import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { fiatCurrencies } from "../utils/typebox/fiat-currency";
import { user } from "./schema-auth";

export const asset = pgTable(
  "asset",
  {
    id: text("id").primaryKey(),
    isin: text("isin"),
    internalid: text("internalid"),
  },
  (table) => [
    index("asset_isin_idx").on(table.isin),
    index("asset_internalid_idx").on(table.internalid),
  ]
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

export const airdropDistribution = pgTable(
  "airdrop_distribution",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    airdropId: text("airdrop_id").notNull(),
    recipient: text("recipient").notNull(),
    amount: numeric("amount", {
      precision: 36,
      scale: 18,
    }).notNull(),
    index: integer("index").notNull(),
    claimed: timestamp("claimed", { withTimezone: true }),
  },
  (table) => [
    index("airdrop_distribution_recipient_idx").on(table.recipient),
    index("airdrop_distribution_airdrop_id_idx").on(table.airdropId),
    index("airdrop_distribution_recipient_airdrop_idx").on(
      table.recipient,
      table.airdropId
    ),
    unique("airdrop_distribution_unique_constraint").on(
      table.airdropId,
      table.recipient
    ),
  ]
);
