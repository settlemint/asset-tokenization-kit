import type {
  MicaDocument,
  MicaRegulationConfig,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import {
  MicaDocumentType,
  ReserveComplianceStatus,
} from "@/lib/db/regulations/schema-mica-regulation-configs";

/**
 * Checks if a MICA regulation config has complete authorization data
 * @param config The MICA regulation config to check
 * @returns true if all required authorization fields are present
 */
export function isAuthorized(config: MicaRegulationConfig): boolean {
  return !!(
    config.licenceNumber &&
    config.regulatoryAuthority &&
    config.approvalDate
  );
}

/**
 * Checks if required MICA documents are present
 * @param config The MICA regulation config to check
 * @returns true if all required documents are present
 */
export function hasRequiredDocuments(config: MicaRegulationConfig): boolean {
  const hasWhitePaper = config.documents?.some(
    (doc: MicaDocument) => doc.type === MicaDocumentType.WHITE_PAPER
  );
  const hasAudit = config.documents?.some(
    (doc: MicaDocument) => doc.type === MicaDocumentType.AUDIT
  );
  return !!(hasWhitePaper && hasAudit);
}

/**
 * Checks if reserve status is compliant
 * @param config The MICA regulation config to check
 * @returns true if reserve status is compliant
 */
export function isReserveCompliant(config: MicaRegulationConfig): boolean {
  return config.reserveStatus === ReserveComplianceStatus.COMPLIANT;
}

/**
 * Calculates all compliance requirements and their status
 * @param config The MICA regulation config to check
 * @returns true if all compliance requirements are met
 */
export function isCompliant(config: MicaRegulationConfig): boolean {
  return (
    isReserveCompliant(config) &&
    isAuthorized(config) &&
    hasRequiredDocuments(config)
  );
}
