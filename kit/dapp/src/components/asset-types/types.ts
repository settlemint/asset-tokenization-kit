import type { AssetExtension } from "@atk/zod/asset-extensions";
import type { TokenTypeEnum } from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import type { LucideIcon } from "lucide-react";

export type AssetTypeOption = (typeof TokenTypeEnum.options)[number];

export interface BaseAssetTypeProps {
  assetType: AssetTypeOption;
  className?: string;
}

export interface AssetTypeSelectionProps extends BaseAssetTypeProps {
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  isDisabled?: boolean;
  disabledLabel?: string;
  variant: "checkbox" | "radio";
}

export interface AssetTypeManagementProps extends BaseAssetTypeProps {
  extensions: AssetExtension[];
  isDeployed: boolean;
  hasSystemManagerRole: boolean;
  isDeploying?: boolean;
  isDeployingThisType?: boolean;
  onEnable?: (assetType: AssetTypeOption) => void;
  // Optional verification form for secure operations
  verificationForm?: {
    setFieldValue: (field: string, value: any) => void;
    VerificationButton: React.ComponentType<{
      onSubmit: () => void;
      disabled?: boolean;
      walletVerification: {
        title: string;
        description: string;
        setField: (verification: any) => void;
      };
      children: React.ReactNode;
    }>;
  };
}

export interface AssetTypeDisplayProps extends BaseAssetTypeProps {
  extensions?: AssetExtension[];
  showExtensions?: boolean;
  children?: React.ReactNode;
}

export interface AssetClassSelectionProps {
  assetClass: {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    factories: Array<{
      typeId: string;
      tokenExtensions: AssetExtension[];
    }>;
  };
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}