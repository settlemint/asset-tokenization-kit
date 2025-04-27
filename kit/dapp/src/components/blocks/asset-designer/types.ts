// Asset designer shared types

// Define the asset types
export type AssetType =
  | "bond"
  | "cryptocurrency"
  | "equity"
  | "fund"
  | "stablecoin"
  | "deposit"
  | null;

// Define the step types
export type AssetDesignerStep =
  | "type"
  | "details"
  | "configuration"
  | "permissions"
  | "regulation"
  | "summary";

// Define details for each step (title, description)
export const stepDetailsMap: Record<
  AssetDesignerStep,
  { title: string; description: string }
> = {
  type: {
    title: "Asset Type",
    description: "Choose the type of digital asset to create.",
  },
  details: {
    title: "Basic information",
    description: "Provide general information about your asset.",
  },
  configuration: {
    title: "Asset configuration",
    description: "Configure specific parameters for your asset.",
  },
  permissions: {
    title: "Asset permissions",
    description: "Define who can manage and use this asset.",
  },
  regulation: {
    title: "Regulation",
    description: "Configure regulatory requirements for your asset.",
  },
  summary: {
    title: "Summary",
    description: "Review all the details before issuing your asset.",
  },
};

// Define the order of steps
export const stepsOrder: AssetDesignerStep[] = [
  "type",
  "details",
  "configuration",
  "permissions",
  "regulation",
  "summary",
];

// Asset type descriptions
export const assetTypeDescriptions: Record<NonNullable<AssetType>, string> = {
  bond: "Debt instruments issued as tokenized securities.",
  cryptocurrency:
    "Decentralized digital assets used as a medium of exchange or store of value.",
  equity: "Assets representing ownership in a company.",
  fund: "Investment vehicles pooled by professional managers.",
  stablecoin: "Digital assets pegged to a stable asset like USD.",
  deposit: "Digital assets that represent a deposit of a traditional asset.",
};

// Define a base form type that contains all possible fields
export interface BaseFormValues {
  assetName: string;
  symbol: string;
  decimals?: number;
  isin?: string;
  cusip?: string;
  assetAdmins: string[];
  selectedRegulations: string[];
}

// Document types
export interface UploadedDocument {
  id: string;
  name: string;
  title: string;
  type: string;
  description: string;
  url?: string;
}

export interface UploadedDocumentsState {
  [regulationId: string]: UploadedDocument[];
}

// Verification data
export interface VerificationData {
  action: any;
  formData: any;
}

// Region regulations type
export interface Regulation {
  id: string;
  name: string;
  description: string;
}

export interface RegionRegulations {
  [region: string]: Regulation[];
}
