import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type AssetFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@atk/zod/asset-types";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface EnabledAssetTypesProps {
  tokenFactories: Array<{
    id: string;
    typeId: string;
  }>;
}

export const EnabledAssetTypes = memo(function EnabledAssetTypes({
  tokenFactories,
}: EnabledAssetTypesProps) {
  const { t } = useTranslation(["navigation", "tokens", "onboarding"]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("settings.assetTypes.enabledTitle", { ns: "navigation" })}
        </CardTitle>
        <CardDescription>
          {t("settings.assetTypes.enabledDescription", { ns: "navigation" })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tokenFactories.map((factory) => {
            const assetType = getAssetTypeFromFactoryTypeId(
              factory.typeId as AssetFactoryTypeId
            );
            const Icon = getAssetIcon(assetType);

            return (
              <div
                key={factory.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {t(`asset-types.${assetType}`, { ns: "tokens" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`assets.descriptions.${assetType}`, {
                        ns: "onboarding",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
