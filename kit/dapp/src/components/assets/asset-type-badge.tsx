import { ASSET_COLORS } from "@/components/assets/asset-colors";
import { useAssetTypePlural } from "@/lib/utils/asset-pluralization";
import type { AssetType } from "@atk/zod/asset-types";

export function AssetTypeBadge({ assetType }: { assetType: AssetType }) {
  const pluralizeAsset = useAssetTypePlural();
  const translatedAssetType = pluralizeAsset(assetType, 1);

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-3 rounded-full"
        style={{
          backgroundColor: ASSET_COLORS[assetType],
        }}
      />
      <span className="font-medium capitalize">{translatedAssetType}</span>
    </div>
  );
}
