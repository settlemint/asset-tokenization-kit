import { DepositWizard } from "@/components/asset-designer/deposit/deposit-wizard";
import { DialogLayout } from "@/components/layout/dialog";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/asset-designer/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DialogLayout>
      <DepositWizard />
    </DialogLayout>
  );
}
