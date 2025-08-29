/**
 * ATK Protocol Topic Constants
 *
 * These constants must match the topic names defined in contracts/system/ATKTopics.sol
 * Topic IDs are dynamically generated during system bootstrap using keccak256(abi.encodePacked(name))
 */
export enum ATKTopic {
  // Investor-level
  kyc = "knowYourCustomer",
  aml = "antiMoneyLaundering",
  qii = "qualifiedInstitutionalInvestor",
  professionalInvestor = "professionalInvestor",
  accreditedInvestor = "accreditedInvestor",
  accreditedInvestorVerified = "accreditedInvestorVerified",
  regS = "regulationS",

  // Issuer-level
  issuerProspectusFiled = "issuerProspectusFiled",
  issuerProspectusExempt = "issuerProspectusExempt",
  issuerLicensed = "issuerLicensed",
  issuerReportingCompliant = "issuerReportingCompliant",
  issuerJurisdiction = "issuerJurisdiction",

  // Asset-level
  collateral = "collateral",
  isin = "isin",
  assetClassification = "assetClassification",
  basePrice = "basePrice",
  assetIssuer = "assetIssuer",

  // General
  contractIdentity = "contractIdentity",
}
