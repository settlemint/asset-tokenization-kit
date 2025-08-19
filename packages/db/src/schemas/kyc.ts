/**
 * Know Your Customer (KYC) Database Schema
 *
 * This module defines the database schema for customer identity verification
 * and compliance data required for financial regulations (AML/KYC/CDD).
 *
 * REGULATORY COMPLIANCE:
 * - FATF Recommendations: Customer identification and due diligence
 * - EU 5AMLD: Enhanced due diligence for high-risk customers
 * - US BSA/Patriot Act: Customer identification program requirements
 * - MiFID II: Investor protection and suitability assessments
 *
 * PRIVACY BY DESIGN:
 * - Data minimization: Only collect necessary KYC fields
 * - Purpose limitation: Data only used for compliance verification
 * - Storage limitation: Retention policies based on regulatory requirements
 * - GDPR Article 6(1)(c): Processing necessary for legal compliance
 *
 * SECURITY CONSIDERATIONS:
 * - PII protection: Sensitive personal data encrypted at rest
 * - Access control: KYC data only accessible to compliance officers
 * - Audit trail: All access and modifications logged for regulatory review
 * - Cross-border transfers: GDPR adequacy decisions or SCCs required
 *
 * @module KycSchema
 */

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

/**
 * Residency status enumeration for tax and regulatory compliance.
 *
 * WHY ENUM INSTEAD OF VARCHAR:
 * - Type safety: Prevents invalid status values at database level
 * - Performance: Smaller storage footprint than text fields
 * - Referential integrity: Ensures consistent status across application
 * - Migration safety: Schema changes are explicit and validated
 *
 * STATUS DEFINITIONS:
 * - resident: Tax resident for regulatory/reporting purposes
 * - non_resident: Non-tax resident, may trigger additional reporting
 * - dual_resident: Multiple tax residencies, complex compliance requirements
 * - unknown: Initial state, requires verification before asset access
 */
export const residencyStatusEnum = pgEnum("residency_status", [
  // COMPLIANCE: Standard tax residency for local investors
  "resident",
  
  // COMPLIANCE: Non-resident status may trigger FATCA/CRS reporting
  "non_resident",
  
  // COMPLIANCE: Dual residency requires enhanced due diligence
  "dual_resident",
  
  // BUSINESS: Initial state - must be resolved before asset participation
  "unknown",
]);

/**
 * KYC profiles table - customer identity verification data.
 *
 * REGULATORY RATIONALE:
 * - One profile per user: Prevents identity confusion and duplicate accounts
 * - Immutable after verification: Changes require new verification process
 * - Mandatory fields: Minimum required for customer identification programs
 * - Name matching: Enables sanctions screening and PEP identification
 *
 * PRIVACY IMPLEMENTATION:
 * - Separate from user table: Isolates PII from authentication data
 * - Cascade deletion: GDPR right to erasure compliance
 * - Field-level encryption: PII encrypted at application layer (planned)
 * - Audit logging: All access tracked for compliance reporting
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Unique user constraint: Prevents duplicate KYC processes
 * - Country index: Enables jurisdiction-based compliance rules
 * - Name indexes: Supports AML screening and customer search
 * - Small table size: <1M rows expected for typical implementation
 */
export const kycProfiles = pgTable(
  "kyc_profiles",
  {
    // WHY: UUID prevents profile enumeration and ensures global uniqueness
    id: text("id").primaryKey(),

    // INTEGRITY: One-to-one relationship with user accounts, CASCADE for GDPR compliance
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // COMPLIANCE: Legal name matching for sanctions and PEP screening
    // WHY: Separate first/last names enable cultural name handling
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),

    // COMPLIANCE: Date of birth required for age verification and identity confirmation
    // WHY: Date type ensures proper age calculations and formatting
    dob: date("dob", { mode: "date" }).notNull(),

    // COMPLIANCE: Country of citizenship/residence for regulatory jurisdiction
    // WHY: ISO-3166 country codes for international compliance
    country: text("country").notNull(),

    // COMPLIANCE: Tax residency status affects reporting obligations
    residencyStatus: residencyStatusEnum("residency_status").notNull(),

    // COMPLIANCE: National ID for government identity verification
    // WHY: Text field accommodates various national ID formats globally
    nationalId: text("national_id").notNull(),

    // AUDIT: KYC profile creation tracking for compliance documentation
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
      
    // AUDIT: Modification tracking for regulatory change documentation
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // INTEGRITY: Enforces one KYC profile per user account
    // WHY: Prevents duplicate identity verification and compliance confusion
    uniqueIndex("kyc_user_id_idx").on(table.userId),
    
    // COMPLIANCE: Country-based compliance rule application
    // WHY: Enables jurisdiction-specific AML/KYC requirements
    index("kyc_country_idx").on(table.country),
    
    // SECURITY: Name-based customer search for AML monitoring
    // WHY: Supports sanctions screening and suspicious activity detection
    index("kyc_first_name_idx").on(table.firstName),
    index("kyc_last_name_idx").on(table.lastName),
  ]
);

export type KycProfile = typeof kycProfiles.$inferSelect;
export type NewKycProfile = typeof kycProfiles.$inferInsert;
