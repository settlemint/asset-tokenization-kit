import type { ClaimInfo } from "@/orpc/helpers/claims/create-claim";
import type { ClaimData } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";

/**
 * Convert API ClaimData (stringified numerics) to internal ClaimInfo types.
 */
export function toClaimInfo(apiClaim: ClaimData): ClaimInfo {
  switch (apiClaim.topic) {
    case "collateral":
      return {
        topic: apiClaim.topic,
        data: {
          amount: BigInt(apiClaim.data.amount),
          expiryTimestamp: BigInt(apiClaim.data.expiryTimestamp),
        },
      } as ClaimInfo;
    case "basePrice":
      return {
        topic: apiClaim.topic,
        data: {
          amount: BigInt(apiClaim.data.amount),
          currencyCode: apiClaim.data.currencyCode,
          decimals: apiClaim.data.decimals,
        },
      } as ClaimInfo;
    case "issuerLicensed":
      return {
        topic: apiClaim.topic,
        data: {
          licenseType: apiClaim.data.licenseType,
          licenseNumber: apiClaim.data.licenseNumber,
          jurisdiction: apiClaim.data.jurisdiction,
          validUntil: BigInt(apiClaim.data.validUntil),
        },
      } as ClaimInfo;
    case "issuerReportingCompliant":
      return {
        topic: apiClaim.topic,
        data: {
          compliant: apiClaim.data.compliant,
          lastUpdated: BigInt(apiClaim.data.lastUpdated),
        },
      } as ClaimInfo;
    // Pass-through topics without numeric conversions
    case "knowYourCustomer":
    case "antiMoneyLaundering":
    case "qualifiedInstitutionalInvestor":
    case "professionalInvestor":
    case "accreditedInvestor":
    case "accreditedInvestorVerified":
    case "regulationS":
    case "assetClassification":
    case "assetIssuer":
    case "contractIdentity":
    case "isin":
    case "issuerJurisdiction":
    case "issuerProspectusExempt":
    case "issuerProspectusFiled":
      return apiClaim as unknown as ClaimInfo;
    default:
      return apiClaim as unknown as ClaimInfo;
  }
}
