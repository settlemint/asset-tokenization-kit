import { DenominationAssetTable } from "@/components/tables/denomination-assets";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { seo } from "@atk/config/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/denomination-asset"
)({
  head: () => ({
    meta: seo({
      title: "Denomination Assets",
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["tokens", "common"]);
  const { asset } = useTokenLoaderQuery();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("tokens:tabs.denominationAsset")}
        </h2>
        <p className="text-muted-foreground">
          {t("tokens:descriptions.denominationAssetTab", {
            assetName: asset.name,
          })}
        </p>
      </div>

      <DenominationAssetTable tokenAddress={asset.id} />
    </div>
  );
}
