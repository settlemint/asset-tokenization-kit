import { AssetDesignerForm } from "@/components/asset-designer/asset-designer-form";
import { DialogLayout } from "@/components/layout/dialog";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/asset-designer/")({
  beforeLoad: async ({ context: { queryClient, orpc } }) => {
    const factories = await queryClient.ensureQueryData(
      orpc.token.factoryList.queryOptions({ input: {} })
    );

    return { factories };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const routeContext = Route.useRouteContext();

  return (
    <DialogLayout>
      <AssetDesignerForm factories={routeContext.factories} />
    </DialogLayout>
  );
}
