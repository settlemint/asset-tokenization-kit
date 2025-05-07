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
  // Trigger validation for basic fields
  form.trigger();

  // Basic way to check if all fields are valid - schema validation will handle the details
  return Object.keys(form.formState.errors).length === 0;
}

// Check if the configuration form is valid
export function isConfigurationValid(
  form: UseFormReturn<any>,
  assetType: AssetType
): boolean {
  // Trigger validation
  form.trigger();

  // Schema validation will handle which fields are required and valid
  return Object.keys(form.formState.errors).length === 0;
}

// Helper function to get configuration fields by asset type
function getConfigurationFields(assetType: AssetType): string[] {
  switch (assetType) {
    case "bond":
      return ["cap", "faceValue", "maturityDate", "underlyingAsset"];
    case "cryptocurrency":
      return ["initialSupply", "price.amount", "price.currency"];
    case "equity":
      return [
        "equityClass",
        "equityCategory",
        "price.amount",
        "price.currency",
      ];
    case "fund":
      return [
        "fundCategory",
        "fundClass",
        "managementFeeBps",
        "price.amount",
        "price.currency",
      ];
    case "stablecoin":
    case "deposit":
      return [
        "collateralLivenessValue",
        "collateralLivenessTimeUnit",
        "price.amount",
        "price.currency",
      ];
    default:
      return [];
  }
}

// Handle asset creation submission error
export function handleAssetCreationError(error: any): void {
  console.error("Error creating asset:", error);
  toast.error("An unexpected error occurred. Please try again.");
}
