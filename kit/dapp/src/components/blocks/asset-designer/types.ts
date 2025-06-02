import { MicaDocumentType } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { AssetType } from "@/lib/utils/typebox/asset-types";
import { useTranslations } from "next-intl";

type TranslationKeys = Parameters<
  ReturnType<typeof useTranslations<"private.assets.create">>
>[0];

export interface AssetFormStep {
  id: string;
  title: TranslationKeys;
  description: TranslationKeys;
}

// Interface that each asset form will implement
export interface AssetFormDefinition {
  // Steps for this asset type
  steps: AssetFormStep[];
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

// Document types
export interface UploadedDocument {
  id: string;
  name: string;
  title: string;
  type: MicaDocumentType | "mica";
  description: string;
  url: string;
  objectName: string; // Path in MinIO storage
  fileName?: string; // Original file name
  uploadedAt?: string; // ISO timestamp of when the document was uploaded
  size?: number; // File size in bytes
}

export interface UploadedDocumentsState {
  [regulationId: string]: UploadedDocument[];
}
