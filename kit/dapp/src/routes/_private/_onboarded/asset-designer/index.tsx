import { AssetDesignerForm } from "@/components/asset-designer/asset-designer-form";
import { DialogLayout } from "@/components/layout/dialog";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/asset-designer/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DialogLayout>
      <AssetDesignerForm />
    </DialogLayout>
  );
}
