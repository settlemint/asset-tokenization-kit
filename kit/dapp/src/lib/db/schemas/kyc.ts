import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const residencyStatusEnum = pgEnum("residency_status", [
  "resident",
  "non_resident",
]);

export const kycProfiles = pgTable(
  "kyc_profiles",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),

    dob: date("dob", { mode: "date" }).notNull(),

    nationality: text("nationality").notNull(),

    residencyStatus: residencyStatusEnum("residency_status").notNull(),

    nationalIdEncrypted: text("national_id_encrypted").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("kyc_user_id_idx").on(table.userId),
    index("kyc_nationality_idx").on(table.nationality),
    index("kyc_first_name_idx").on(table.firstName),
    index("kyc_last_name_idx").on(table.lastName),
  ]
);

export type KycProfile = typeof kycProfiles.$inferSelect;
export type NewKycProfile = typeof kycProfiles.$inferInsert;
