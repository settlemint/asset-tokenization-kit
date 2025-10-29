import { residencyStatuses } from "@atk/zod/residency-status";
import {
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const residencyStatusEnum = pgEnum(
  "residency_status",
  residencyStatuses
);

export const kycProfiles = pgTable(
  "kyc_profiles",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    firstName: text("first_name"),
    lastName: text("last_name"),

    dob: date("dob", { mode: "date" }),

    country: text("country"),

    residencyStatus: residencyStatusEnum("residency_status"),

    nationalId: text("national_id"),

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
    index("kyc_country_idx").on(table.country),
    index("kyc_first_name_idx").on(table.firstName),
    index("kyc_last_name_idx").on(table.lastName),
  ]
);

export type KycProfile = typeof kycProfiles.$inferSelect;
export type NewKycProfile = typeof kycProfiles.$inferInsert;
