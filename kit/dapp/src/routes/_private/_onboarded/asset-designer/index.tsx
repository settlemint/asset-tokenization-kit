import { AssetDesignerForm } from "@/components/asset-designer/asset-designer-form";
import { Logo } from "@/components/logo/logo";
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
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center border-b px-8">
        <Logo className="h-8" />
      </header>
      <main className="flex-1 overflow-hidden">
        <AssetDesignerForm factories={routeContext.factories} />
      </main>
    </div>
  );
}
