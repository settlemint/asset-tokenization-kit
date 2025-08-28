import { AssetExtensionsList } from "@/components/asset-extensions/asset-extensions-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check } from "lucide-react";
import { AssetTypeCardBase } from "./asset-type-card-base";
import type { AssetTypeManagementProps } from "./types";
import { useTranslation } from "react-i18next";

export function AssetTypeManagementCard({
  assetType,
  extensions,
  isDeployed,
  hasSystemManagerRole,
  isDeploying = false,
  isDeployingThisType = false,
  onEnable,
  verificationForm,
  className,
}: AssetTypeManagementProps) {
  const { t } = useTranslation(["onboarding", "common", "navigation", "asset-types"]);

  const handleEnable = () => {
    if (!hasSystemManagerRole || isDeployed || isDeploying) return;
    onEnable?.(assetType);
  };

  const statusBadge = isDeployed ? (
    <Badge 
      variant="outline" 
      className="flex items-center gap-1 h-9 px-3 text-sm bg-gray-100 text-gray-600 border-gray-200"
    >
      <Check className="h-3 w-3" />
      {t("settings.assetTypes.enabled", { 
        ns: "navigation",
        defaultValue: "Enabled"
      })}
    </Badge>
  ) : (
    <Badge variant="outline" className="h-9 px-3 text-sm">
      {t("assets.not-deployed-label", { 
        ns: "onboarding",
        defaultValue: "Not Deployed"
      })}
    </Badge>
  );

  // Use verification button if provided, otherwise simple button
  const actionButton = !isDeployed && hasSystemManagerRole ? (
    verificationForm ? (
      <verificationForm.VerificationButton
        onSubmit={handleEnable}
        disabled={isDeploying}
        walletVerification={{
          title: t("settings.assetTypes.confirmEnableTitle", {
            ns: "navigation",
            assetType: t(`types.${assetType}.name`, {
              ns: "asset-types",
            }),
          }),
          description: t("settings.assetTypes.confirmEnableDescription", {
            ns: "navigation",
          }),
          setField: (verification: any) => {
            verificationForm.setFieldValue("walletVerification", verification);
          },
        }}
      >
        {isDeployingThisType ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          t("settings.assetTypes.enable", { ns: "navigation" })
        )}
      </verificationForm.VerificationButton>
    ) : (
      <Button
        size="sm"
        onClick={handleEnable}
        disabled={isDeploying}
        className="ml-2"
      >
        {isDeployingThisType ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {t("assets.deploying", { ns: "onboarding" })}
          </>
        ) : (
          t("assets.enable", { 
            ns: "onboarding", 
            defaultValue: "Enable" 
          })
        )}
      </Button>
    )
  ) : null;

  return (
    <AssetTypeCardBase
      assetType={assetType}
      variant="management"
      className={className}
      headerActions={
        <div className="flex items-center">
          {statusBadge}
          {actionButton}
        </div>
      }
    >
      <div className="space-y-4">
        <AssetExtensionsList 
          extensions={extensions} 
          className="mt-0"
        />
        
        {!hasSystemManagerRole && !isDeployed && (
          <div className="text-xs text-muted-foreground">
            {t("assets.admin-required", { 
              ns: "onboarding",
              defaultValue: "System manager role required to enable asset types"
            })}
          </div>
        )}
      </div>
    </AssetTypeCardBase>
  );
}