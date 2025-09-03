import { z } from 'zod';


/**
 * Tuple of valid claim topic IDs for type-safe iteration.
 * @remarks
 * This constant defines all supported addon types in the platform:
 * - `knowYourCustomer`: Know Your Customer (KYC)
 * - `antiMoneyLaundering`: Anti-Money Laundering (AML)
 * - `qualifiedInstitutionalInvestor`: Qualified Institutional Investor (QII)
 * - `professionalInvestor`: Professional Investor
 * - `accreditedInvestor`: Accredited Investor
 * - `accreditedInvestorVerified`: Accredited Investor Verified
 * - `regulationS`: Regulation S
 * - `issuerProspectusFiled`: Issuer Prospectus Filed
 * - `issuerProspectusExempt`: Issuer Prospectus Exempt
 * - `issuerLicensed`: Issuer Licensed
 * - `issuerReportingCompliant`: Issuer Reporting Compliant
 * - `issuerJurisdiction`: Issuer Jurisdiction
 * - `collateral`: Collateral
 * - `isin`: ISIN
 * - `assetClassification`: Asset Classification
 * - `basePrice`: Base Price
 * - `assetIssuer`: Asset Issuer
 * - `contractIdentity`: Contract Identity
 */
export const claimTopicIds = [
  'accreditedInvestor',
  'accreditedInvestorVerified',
  'antiMoneyLaundering',
  'assetClassification',
  'assetIssuer',
  'basePrice',
  'collateral',
  'contractIdentity',
  'isin',
  'issuerJurisdiction',
  'issuerLicensed',
  'issuerProspectusExempt',
  'issuerProspectusFiled',
  'issuerReportingCompliant',
  'knowYourCustomer',
  'professionalInvestor',
  'qualifiedInstitutionalInvestor',
  'regulationS',
] as const;

/**
 * Creates a Zod schema that validates a claim topic ID.
 * @remarks
 * Features:
 * - Strict enum validation against predefined claim topics
 * - Type-safe inference for claim topic IDs
 * - Descriptive error messages for invalid claim topics
 * - Case-sensitive matching (must match enum exactly)
 * @returns A Zod enum schema for claim topic ID validation
 * @example
 * ```typescript
 * const schema = claimTopicIds();
 * schema.parse("knowYourCustomer"); // Returns "knowYourCustomer" as ClaimTopic
 * schema.parse("invalid"); // Throws ZodError
 *
 * // Use in form validation
 * const formSchema = z.object({
 *   topic: claimTopicIds(),
 *   value: z.string()
 * });
 * ```
 */
export const claimTopicId = () => z.enum(claimTopicIds).describe("Claim topic IDs");