import { Badge } from "@/components/ui/badge";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { TokenTypeEnum } from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AssetTypeActionsProps {
  assetType: (typeof TokenTypeEnum.options)[number];
  isDeployed: boolean;
  hasSystemManagerRole: boolean;
  isDeploying: boolean;
  isDeployingThisType: boolean;
  onEnable: (assetType: (typeof TokenTypeEnum.options)[number]) => void;
  form: {
    setFieldValue: (
      field: "walletVerification",
      value: UserVerification
    ) => void;
    VerificationButton: React.ComponentType<{
      onSubmit: () => void;
      disabled?: boolean;
      walletVerification: {
        title: string;
        description: string;
        setField: (verification: UserVerification) => void;
      };
      children: React.ReactNode;
    }>;
  };
}

export function AssetTypeActions({
  assetType,
  isDeployed,
  hasSystemManagerRole,
  isDeploying,
  isDeployingThisType,
  onEnable,
  form,
}: AssetTypeActionsProps): React.ReactElement {
  const { t } = useTranslation(["navigation", "asset-types"]);

  if (isDeployed) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 h-9 px-3 text-sm"
      >
        <CheckCircle2 className="h-3 w-3" />
        {t("settings.assetTypes.enabled", { ns: "navigation" })}
      </Badge>
    );
  }

  if (!hasSystemManagerRole) {
    return <></>;
  }

  return (
    <form.VerificationButton
      onSubmit={() => {
        onEnable(assetType);
      }}
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
        setField: (verification: UserVerification) => {
          form.setFieldValue("walletVerification", verification);
        },
      }}
    >
      {isDeployingThisType ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        t("settings.assetTypes.enable", { ns: "navigation" })
      )}
    </form.VerificationButton>
  );
}
