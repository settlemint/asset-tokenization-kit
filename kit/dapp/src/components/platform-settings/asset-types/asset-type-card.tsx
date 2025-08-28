import { AssetExtensionsList } from "@/components/asset-extensions/asset-extensions-list";
import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import { TokenTypeEnum } from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import type { AssetExtension } from "@atk/zod/asset-extensions";
import { useTranslation } from "react-i18next";

interface AssetTypeCardProps {
  assetType: (typeof TokenTypeEnum.options)[number];
  extensions: AssetExtension[];
  children: React.ReactNode;
}

export function AssetTypeCard({
  assetType,
  extensions,
  children,
}: AssetTypeCardProps): React.ReactElement {
  const { t } = useTranslation("asset-types");
  const Icon = getAssetIcon(assetType);

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border bg-background">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div>
            <h4 className="text-base font-medium">
              {t(`types.${assetType}.name`)}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t(`types.${assetType}.description`)}
            </p>
          </div>
        </div>
        <AssetExtensionsList extensions={extensions} className="mt-3" />
      </div>
      <div className="ml-4 flex items-start">{children}</div>
    </div>
  );
}
