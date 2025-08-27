import { Badge } from "@/components/ui/badge";
import type { SystemAddonType } from "@/orpc/routes/system/addon/routes/addon.create.schema";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { addonTypes } from "@atk/zod/addon-types";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AddonActionsProps {
  addonType: SystemAddonType;
  isDeployed: boolean;
  isRequired: boolean;
  hasSystemManagerRole: boolean;
  isDeploying: boolean;
  onEnable: (addonType: (typeof addonTypes)[number]) => void;
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

export function AddonActions({
  addonType,
  isDeployed,
  isRequired,
  hasSystemManagerRole,
  isDeploying,
  onEnable,
  form,
}: AddonActionsProps): React.ReactElement {
  const { t } = useTranslation("onboarding");

  if (isDeployed) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 h-9 px-3 text-sm"
      >
        <CheckCircle2 className="h-3 w-3" />
        Enabled
      </Badge>
    );
  }

  if (isRequired) {
    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-1 h-9 px-3 text-sm"
      >
        Required
      </Badge>
    );
  }

  if (!hasSystemManagerRole) {
    return <></>;
  }

  return (
    <form.VerificationButton
      onSubmit={() => {
        onEnable(addonType);
      }}
      disabled={isDeploying}
      walletVerification={{
        title: t("system-addons.addon-selection.confirm-deployment-title"),
        description: t("system-addons.addon-selection.confirm-deployment-description"),
        setField: (verification: UserVerification) => {
          form.setFieldValue("walletVerification", verification);
        },
      }}
    >
      {isDeploying ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        "Enable"
      )}
    </form.VerificationButton>
  );
}