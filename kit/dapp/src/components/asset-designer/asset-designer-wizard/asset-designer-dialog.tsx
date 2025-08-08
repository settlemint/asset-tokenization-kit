import { AssetDesignerWizard } from "@/components/asset-designer/asset-designer-wizard/asset-designer-wizard";
import { FullScreenDialogLayout } from "@/components/layout/fullscreen-dialog-layout";

interface AssetDesignerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDesignerDialog({
  open,
  onOpenChange,
}: AssetDesignerDialogProps) {
  return (
    <FullScreenDialogLayout open={open} onOpenChange={onOpenChange}>
      <AssetDesignerWizard />
    </FullScreenDialogLayout>
  );
}
