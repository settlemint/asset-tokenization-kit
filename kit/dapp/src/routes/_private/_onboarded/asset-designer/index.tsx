import { AssetDesignerWizard } from "@/components/asset-designer/asset-designer-wizard/asset-designer-wizard";
import { AssetTokenizationKitLogo } from "@/components/asset-tokenization-kit-logo";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useGoBack } from "@/hooks/use-go-back";
import { assetType } from "@/lib/zod/validators/asset-types";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { z } from "zod";

const searchSchema = z.object({
  type: assetType(),
});

export const Route = createFileRoute("/_private/_onboarded/asset-designer/")({
  validateSearch: searchSchema,
  beforeLoad: async ({ context: { queryClient, orpc } }) => {
    const factories = await queryClient.ensureQueryData(
      orpc.system.tokenFactoryList.queryOptions({ input: {} })
    );

    const complianceModules = await queryClient.ensureQueryData(
      orpc.system.complianceModuleList.queryOptions({ input: {} })
    );

    return { factories, complianceModules };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { type } = Route.useSearch();
  const { onBack } = useGoBack();
  const { t } = useTranslation(["asset-designer"]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center border-b px-8">
        <AssetTokenizationKitLogo />
        <div className="flex-1" />
        <ConfirmationModal
          triggerLabel={t("asset-designer:form.buttons.leave")}
          title={t("asset-designer:leave-confirmation.title")}
          description={t("asset-designer:leave-confirmation.description")}
          leftAction={{
            label: t("asset-designer:leave-confirmation.leave"),
            action: onBack,
          }}
          afterLeftAction="close"
          rightAction={{
            label: t("asset-designer:leave-confirmation.stay"),
            action: "close",
          }}
        />
      </header>
      <main className="flex-1 overflow-hidden">
        <AssetDesignerWizard type={type} />
      </main>
    </div>
  );
}
