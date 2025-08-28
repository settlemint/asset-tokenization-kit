import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import type { BaseAssetTypeProps } from "./types";
import { useTranslation } from "react-i18next";

interface AssetTypeCardBaseProps extends BaseAssetTypeProps {
  children: React.ReactNode;
  variant?: "default" | "compact" | "management";
  headerActions?: React.ReactNode;
}

export function AssetTypeCardBase({
  assetType,
  children,
  className,
  variant = "default",
  headerActions,
}: AssetTypeCardBaseProps) {
  const { t } = useTranslation("asset-types");
  const Icon = getAssetIcon(assetType);
  
  const isCompact = variant === "compact";
  const isManagement = variant === "management";

  return (
    <Card className={cn(
      "relative",
      // Management cards have light blue background like original design
      isManagement && "!bg-blue-50/50 !border-gray-200 !shadow-none",
      className
    )}>
      <CardHeader className={cn(isCompact ? "pb-3" : "pb-4")}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Icon className={cn(
              "text-muted-foreground",
              isCompact ? "h-4 w-4" : "h-5 w-5"
            )} />
            <div>
              <h4 className={cn(
                "font-medium",
                isCompact ? "text-sm" : "text-base"
              )}>
                {t(`types.${assetType}.name`)}
              </h4>
              {!isCompact && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t(`types.${assetType}.description`)}
                </p>
              )}
            </div>
          </div>
          {headerActions && (
            <div className="ml-4 flex items-start">
              {headerActions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(isCompact ? "pt-0" : "pt-2")}>
        {children}
      </CardContent>
    </Card>
  );
}