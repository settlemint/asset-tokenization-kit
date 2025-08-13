import { AssetDesignerWizard } from "@/components/asset-designer/asset-designer-wizard/asset-designer-wizard";
import { FullScreenDialogLayout } from "@/components/layout/fullscreen-dialog-layout";
import { useTranslation } from "react-i18next";

interface AssetDesignerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDesignerDialog({
  open,
  onOpenChange,
}: AssetDesignerDialogProps) {
  const { t } = useTranslation(["asset-designer", "common"]);
  return (
    <FullScreenDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      closeOptions={{
        closeOnEscape: false,
        closeOnOutsideClick: false,
        closeConfirmation: {
          title: t("asset-designer:leave-confirmation.title"),
          description: t("asset-designer:leave-confirmation.description"),
          leftAction: {
            label: t("asset-designer:leave-confirmation.leave"),
            action: () => {
              onOpenChange(false);
            },
          },
          rightAction: {
            label: t("asset-designer:leave-confirmation.stay"),
            action: "close",
          },
          ariaLabel: t("asset-designer:leave-confirmation.leave"),
        },
      }}
    >
      <AssetDesignerWizard
        onSubmit={() => {
          onOpenChange(false);
        }}
      />
    </FullScreenDialogLayout>
  );
}
