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

// Registry of asset forms - currently only bond is implemented
export const assetForms: Record<
  NonNullable<AssetType>,
  () => Promise<{ default: AssetFormDefinition }>
> = {
  bond: () =>
    import("../create-forms/bond/form").then((m) => ({
      default: m.bondFormDefinition,
    })),
  // These will be implemented later - currently they're placeholders
  cryptocurrency: () =>
    Promise.resolve({
      default: {
        steps: [],
        getStepComponent: () => null,
      } as AssetFormDefinition,
    }),
  equity: () =>
    Promise.resolve({
      default: {
        steps: [],
        getStepComponent: () => null,
      } as AssetFormDefinition,
    }),
  fund: () =>
    Promise.resolve({
      default: {
        steps: [],
        getStepComponent: () => null,
      } as AssetFormDefinition,
    }),
  stablecoin: () =>
    Promise.resolve({
      default: {
        steps: [],
        getStepComponent: () => null,
      } as AssetFormDefinition,
    }),
  deposit: () =>
    Promise.resolve({
      default: {
        steps: [],
        getStepComponent: () => null,
      } as AssetFormDefinition,
    }),
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
