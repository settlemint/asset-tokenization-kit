import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { AssetType, RegionRegulations } from "./types";

// Define the regulations available for each region
export const regionRegulations: RegionRegulations = {
  EU: [
    {
      id: "mica",
      name: "MiCA (Markets in Crypto-assets)",
      description: "EU regulatory framework for crypto-assets",
    },
  ],
  US: [
    {
      id: "sec",
      name: "SEC Compliance",
      description: "Securities and Exchange Commission requirements",
    },
  ],
  UK: [
    {
      id: "fca",
      name: "FCA Guidance",
      description: "Financial Conduct Authority regulatory framework",
    },
  ],
  SG: [
    {
      id: "mas-psa",
      name: "MAS PSA",
      description: "Monetary Authority of Singapore Payment Services Act",
    },
    {
      id: "fsra-sg",
      name: "FSRA",
      description: "Financial Services Regulatory Authority",
    },
  ],
  JP: [
    {
      id: "fsra-jp",
      name: "FSRA",
      description: "Financial Services Regulatory Authority",
    },
  ],
  CH: [
    {
      id: "finma",
      name: "FINMA Regulation",
      description: "Swiss Financial Market Supervisory Authority",
    },
  ],
};

// Get the title for the asset type
export function getAssetTitle(assetType: AssetType): string {
  if (!assetType) return "Design a new asset";

  return `Design a new ${assetType}`;
}

// Get the description for the asset type
export function getAssetDescription(assetType: AssetType): string {
  if (!assetType) return "Create your digital asset in a few steps";

  switch (assetType) {
    case "bond":
      return "Debt instruments issued as tokenized securities.";
    case "cryptocurrency":
      return "Decentralized digital assets used as a medium of exchange or store of value.";
    case "equity":
      return "Assets representing ownership in a company.";
    case "fund":
      return "Investment vehicles pooled by professional managers.";
    case "stablecoin":
      return "Digital assets pegged to a stable asset like USD.";
    case "deposit":
      return "Digital assets that represent a deposit of a traditional asset.";
    default:
      return "Create your digital asset in a few steps";
  }
}

// Check if the basic information form is valid
export function isBasicInfoValid(form: UseFormReturn<any>): boolean {
  // Mark all fields as touched to force validation
  form.trigger();

  // Get form state
  const { errors } = form.formState;

  // For the details step, check specific required fields
  const formValues = form.getValues();
  const hasAssetName = !!formValues.assetName;
  const hasSymbol = !!formValues.symbol;
  const hasValidDecimals =
    typeof formValues.decimals === "number" && formValues.decimals > 0;

  // Check if any fields have errors
  const hasErrors = Object.keys(errors).length > 0;

  // Form is valid only if all required fields have values and there are no errors
  return hasAssetName && hasSymbol && hasValidDecimals && !hasErrors;
}

// Check if the configuration form is valid
export function isConfigurationValid(
  form: UseFormReturn<any>,
  assetType: AssetType
): boolean {
  // Mark all fields as touched to force validation
  form.trigger();

  // Get form values and check specific required fields for configuration
  const formValues = form.getValues();
  let requiredFieldsValid = false;

  // Get errors from form state
  const formErrors = form.formState.errors;
  const hasErrors = Object.keys(formErrors).length > 0;

  const hasPrice = !!formValues.price?.amount && !!formValues.price?.currency;
  const hasCollateralLiveness =
    !!formValues.collateralLivenessValue &&
    !!formValues.collateralLivenessTimeUnit;

  // Check asset-specific required fields
  switch (assetType) {
    case "bond":
      // Check if required fields are filled
      const hasCap = !!formValues.cap;
      const hasFaceValue = !!formValues.faceValue;
      const hasMaturityDate = !!formValues.maturityDate;
      const hasUnderlyingAsset = !!formValues.underlyingAsset;

      requiredFieldsValid =
        hasCap && hasFaceValue && hasMaturityDate && hasUnderlyingAsset;
      break;

    case "cryptocurrency":
      const hasInitialSupply = !!formValues.initialSupply;

      requiredFieldsValid = hasInitialSupply && hasPrice;
      break;

    case "equity":
      const hasEquityClass = !!formValues.equityClass;
      const hasEquityCategory = !!formValues.equityCategory;

      requiredFieldsValid = hasEquityClass && hasEquityCategory && hasPrice;
      break;

    case "fund":
      const hasFundCategory = !!formValues.fundCategory;
      const hasFundClass = !!formValues.fundClass;
      const hasManagementFeeBps = !!formValues.managementFeeBps;

      requiredFieldsValid = hasFundCategory && hasFundClass && hasPrice;
      hasManagementFeeBps;
      break;

    case "stablecoin":
      requiredFieldsValid = hasCollateralLiveness && hasPrice;
      break;

    case "deposit":
      requiredFieldsValid = hasCollateralLiveness && hasPrice;
      break;

    default:
      requiredFieldsValid = true;
  }

  // Form is valid if required fields are filled and there are no errors
  return requiredFieldsValid && !hasErrors;
}

// Handle asset creation submission error
export function handleAssetCreationError(error: any): void {
  console.error("Error creating asset:", error);
  toast.error("An unexpected error occurred. Please try again.");
}
