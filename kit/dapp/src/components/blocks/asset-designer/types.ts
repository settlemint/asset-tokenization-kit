import { AssetType } from "@/lib/utils/typebox/asset-types";

// Interface that each asset form will implement
export interface AssetFormDefinition {
  // Steps for this asset type
  steps: {
    id: string;
    title: string;
    description: string;
  }[];
  // Component for rendering each step
  getStepComponent: (stepId: string) => React.ComponentType<any> | null;
}

// Registry of asset forms
export const assetForms: Record<
  NonNullable<AssetType>,
  () => Promise<{ default: AssetFormDefinition }>
> = {
  bond: () =>
    import("../create-forms/bond/form").then((m) => ({
      default: m.bondFormDefinition,
    })),
  cryptocurrency: () =>
    import("../create-forms/cryptocurrency/form").then((m) => ({
      default: m.cryptoFormDefinition,
    })),
  deposit: () =>
    import("../create-forms/deposit/form").then((m) => ({
      default: m.depositFormDefinition,
    })),
  equity: () =>
    import("../create-forms/equity/form").then((m) => ({
      default: m.equityFormDefinition,
    })),
  fund: () =>
    import("../create-forms/fund/form").then((m) => ({
      default: m.fundFormDefinition,
    })),
  stablecoin: () =>
    import("../create-forms/stablecoin/form").then((m) => ({
      default: m.stablecoinFormDefinition,
    })),
};

// Common step for asset type selection
export const typeSelectionStep = {
  id: "type",
  title: "select-asset-type.title",
  description: "select-asset-type.description",
};

// Document types
export interface UploadedDocument {
  id: string;
  name: string;
  title: string;
  type: string;
  description: string;
  url?: string;
  objectName?: string; // Path in MinIO storage
  fileName?: string; // Original file name
}

export interface UploadedDocumentsState {
  [regulationId: string]: UploadedDocument[];
}
