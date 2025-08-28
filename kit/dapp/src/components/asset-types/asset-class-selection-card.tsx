import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAssetTypeFromFactoryTypeId } from "@atk/zod/asset-types";
import type { AssetClassSelectionProps } from "./types";
import { useTranslation } from "react-i18next";

export function AssetClassSelectionCard({
  assetClass,
  isSelected,
  onSelect,
  className,
}: AssetClassSelectionProps) {
  const { t } = useTranslation(["asset-class", "asset-types"]);
  const Icon = assetClass.icon;

  return (
    <div
      className={cn(
        "group cursor-pointer",
        className
      )}
      onClick={onSelect}
    >
      <Card className={cn(
        "relative transition-all duration-200",
        isSelected && "ring-2 ring-primary bg-primary/5",
        "hover:shadow-md group-hover:border-primary/50"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">
                  {assetClass.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {assetClass.description}
                </p>
              </div>
            </div>
            <RadioGroupItem
              value={assetClass.id}
              id={`asset-class-${assetClass.id}`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t("includes", { ns: "asset-class" })}
              </p>
              <div className="flex flex-wrap gap-1">
                {assetClass.factories.map((factory) => (
                  <Badge
                    key={factory.typeId}
                    variant="outline"
                    className="text-xs"
                  >
                    {t(
                      `types.${getAssetTypeFromFactoryTypeId(factory.typeId)}.name`,
                      { ns: "asset-types" }
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}