import { AssetDesignerForm } from "@/components/asset-designer/asset-designer-form";
import { AssetTokenizationKitLogo } from "@/components/asset-tokenization-kit-logo";
import { Button } from "@/components/ui/button";
import { useGoBack } from "@/hooks/use-go-back";
import { assetType } from "@/lib/zod/validators/asset-types";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "i18next";
import { z } from "zod";

const searchSchema = z.object({
  type: assetType(),
});

export const Route = createFileRoute("/_private/_onboarded/asset-designer/")({
  validateSearch: searchSchema,
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
  const { type } = Route.useSearch();
  const { onBack } = useGoBack();

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center border-b px-8">
        <AssetTokenizationKitLogo />
        <div className="flex-1" />
        <Button variant="outline" onClick={onBack}>
          {t("asset-designer:form.buttons.exit")}
        </Button>
      </header>
      <main className="flex-1 overflow-hidden">
        <AssetDesignerForm factories={routeContext.factories} type={type} />
      </main>
    </div>
  );
}
