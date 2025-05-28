/**
 * MICA-Specific Regulation Configurations Schema
 *
 * This schema contains fields specific to MICA (Markets in Crypto-Assets) regulation compliance.
 * It extends the base regulation_configs schema with MICA-specific requirements:
 *
 * - Reserve composition requirements
 * - Token classification (EMT/ART)
 * - Legal entity information
 * - Management vetting details
 * - Regulatory approval information
 * - EU passport status
 *
 * Each MICA config has a one-to-one relationship with a record in the base regulation_configs
 * table, linked via the regulationConfigId foreign key.
 */

import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { regulationConfigs } from "./schema-base-regulation-configs";

// Document types specific to MICA
export const MicaDocumentType = {
  WHITE_PAPER: "white_paper",
  AUDIT: "audit",
  POLICY: "policy",
  GOVERNANCE: "governance",
  PROCEDURE: "procedure",
} as const;

export type MicaDocumentType =
  (typeof MicaDocumentType)[keyof typeof MicaDocumentType];

// Document status types
export const DocumentStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

// Document type for MICA
export type MicaDocument = {
  type: MicaDocumentType;
  url: string;
  status: DocumentStatus;
  description?: string;
  title: string;
};

// Reserve compliance status
export const ReserveComplianceStatus = {
  COMPLIANT: "compliant",
  PENDING_REVIEW: "pending_review",
  UNDER_INVESTIGATION: "under_investigation",
  NON_COMPLIANT: "non_compliant",
} as const;

export type ReserveComplianceStatus =
  (typeof ReserveComplianceStatus)[keyof typeof ReserveComplianceStatus];

// Token types
export const TokenType = {
  ELECTRONIC_MONEY_TOKEN: "electronic_money_token",
  ASSET_REFERENCED_TOKEN: "asset_referenced_token",
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

// MICA-specific regulation configs table (one-to-one with regulation configs)
export const micaRegulationConfigs = pgTable("mica_regulation_configs", {
  id: text("id").primaryKey(),
  regulationConfigId: text("regulation_config_id")
    .notNull()
    .references(() => regulationConfigs.id)
    .unique(),

  // Documents specific to MICA
  documents: jsonb("documents").$type<MicaDocument[] | null>(),

  // Reserve data specific to MICA
  reserveComposition: jsonb("reserve_composition").$type<{
    bankDeposits?: number;
    governmentBonds?: number;
    highQualityLiquidAssets?: number;
    corporateBonds?: number;
    centralBankAssets?: number;
    commodities?: number;
    otherAssets?: number;
  } | null>(),
  lastAuditDate: timestamp("last_audit_date", { withTimezone: true }),
  reserveStatus: text("reserve_status"),
  tokenType: text("token_type"),

  // Regulatory approval data (flattened from the previous nested structure)
  licenceNumber: text("licence_number"),
  regulatoryAuthority: text("regulatory_authority"),
  approvalDate: timestamp("approval_date", { withTimezone: true }),
  approvalDetails: text("approval-details"),
});

// Define relation to regulation configs
export const micaRegulationConfigsRelations = relations(
  micaRegulationConfigs,
  ({ one }) => ({
    regulationConfig: one(regulationConfigs, {
      fields: [micaRegulationConfigs.regulationConfigId],
      references: [regulationConfigs.id],
    }),
  })
);

// Export types
export type MicaRegulationConfig = typeof micaRegulationConfigs.$inferSelect;
export type NewMicaRegulationConfig = typeof micaRegulationConfigs.$inferInsert;

// Backward compatible interface for API responses
export interface MicaRegulationConfigResponse {
  id: string;
  regulationConfigId: string;
  documents: MicaDocument[] | null;
  reserveComposition: {
    bankDeposits?: number;
    governmentBonds?: number;
    highQualityLiquidAssets?: number;
    corporateBonds?: number;
    centralBankAssets?: number;
    commodities?: number;
    otherAssets?: number;
  } | null;
  lastAuditDate: Date | null;
  reserveStatus: string | null;
  tokenType: string | null;
  legalEntity: {
    leiCode?: string;
    registrationNumber?: string;
    registeredOfficeAddress?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
  } | null;
  managementVetting: {
    ceoName?: string;
    cfoName?: string;
    boardOfDirectors?: string[];
    complianceOfficer?: string;
    vettingProcessDetails?: string;
  } | null;
  regulatoryApproval: {
    licenceNumber?: string;
    regulatoryAuthority?: string;
    approvalDate?: number;
    approvalDetails?: string;
  } | null;
  euPassportStatus: {
    homeMemberState?: string;
    passportEffectiveDate?: number;
    notifiedCountries?: string[];
    additionalDetails?: string;
  } | null;
}
