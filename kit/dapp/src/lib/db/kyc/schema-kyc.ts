import {
  boolean,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "../schema-auth";

export const documentTypeEnum = pgEnum("document_type", [
  "passport",
  "national_id",
  "drivers_license",
]);

export const sourceOfFundsEnum = pgEnum("source_of_funds", [
  "employment",
  "investments",
  "rental_income",
  "other",
]);

export const kycUser = pgTable(
  "kyc-user",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Personal Information
    fullLegalName: text("full_legal_name"),
    dateOfBirth: date("date_of_birth"),
    nationality: text("nationality"), // ISO https://www.npmjs.com/package/i18n-nationality
    gender: text("gender"),
    phoneNumber: text("phone_number"),
    phoneVerified: boolean("phone_verified").notNull().default(false),

    // Address Information
    street: text("residential_address"),
    city: text("city"),
    zipCode: text("zip_code"),
    country: text("country"), // ISO 4217 https://www.npmjs.com/package/countries-list
    addressProofFileId: text("address_proof_file_id"), // Minio file id

    // Identity Document
    documentType: documentTypeEnum(),
    documentFileIds: text("document_file_ids").array(), // Minio file ids
    documentNumber: text("document_number"),
    documentExpiryDate: timestamp("document_expiry_date", {
      withTimezone: true,
    }),

    // Selfie/Liveness Check
    selfieFileId: text("selfie_file_id"), // Minio file id
    livenessCheckFileId: text("liveness_check_file_id"), // Minio file id

    // Additional Declarations
    sourceOfFunds: sourceOfFundsEnum(),
    taxResidency: text("tax_residency"),
    isPep: boolean("is_pep"), // Politically Exposed Person status

    // Process Status
    consentGiven: boolean("consent_given").notNull().default(false),

    // Verification Status (on chain stored also, do we need this here?)
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedBy: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    verificationStatus: text("verification_status"), // pending, approved, rejected
    rejectionReason: text("rejection_reason"),
    submittedAt: text("submitted_at"),
  },
  (table) => [
    index("kyc_user_id_idx").on(table.userId),
    index("kyc_verification_status_idx").on(table.verificationStatus),
    index("kyc_verified_at_idx").on(table.verifiedAt),
    index("kyc_submitted_at_idx").on(table.submittedAt),
  ]
);
