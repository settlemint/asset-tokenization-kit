import { user } from "@/lib/db/schemas/auth";
import type { Address } from "viem";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Contacts table schema for the user address book.
 *
 * Stores user-managed address book entries that can be reused across
 * transfer flows and other participant selection interfaces.
 */
export const contacts = pgTable(
  "contact",
  {
    /** Contact identifier (UUID) */
    id: text("id").primaryKey(),

    /** Display name chosen by the user */
    name: text("name").notNull(),

    /** Target wallet address stored in checksum format */
    wallet: text("wallet").$type<Address>().notNull(),

    /** Owning user identifier */
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    /** Creation timestamp */
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    /** Last update timestamp */
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("contact_name_idx").on(table.name),
    index("contact_wallet_idx").on(table.wallet),
    index("contact_user_id_idx").on(table.userId),
    uniqueIndex("contact_user_wallet_unique").on(table.userId, table.wallet),
  ]
);

export type InsertContact = typeof contacts.$inferInsert;
export type SelectContact = typeof contacts.$inferSelect;
