import { AssetExtensionsList } from "@/components/asset-extensions/asset-extensions-list";
import { AssetTypeCardBase } from "./asset-type-card-base";
import type { AssetTypeDisplayProps } from "./types";

export function AssetTypeDisplayCard({
  assetType,
  extensions,
  showExtensions = true,
  children,
  className,
}: AssetTypeDisplayProps) {
  return (
    <AssetTypeCardBase
      assetType={assetType}
      className={className}
    >
      <div className="space-y-4">
        {showExtensions && extensions && (
          <AssetExtensionsList 
            extensions={extensions} 
            className="mt-0"
          />
        )}
        
        {children}
      </div>
    </AssetTypeCardBase>
  );
}