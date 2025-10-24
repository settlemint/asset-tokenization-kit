import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { ExpressionView } from "@/components/expression-builder/expression-view";
import { useCountries } from "@/hooks/use-countries";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { orpc } from "@/orpc/orpc-client";
import { ExpressionTypeEnum } from "@atk/zod/src/expression-type";
import { getTopicId, type ATKTopic } from "@atk/zod/src/topics";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { divide, from } from "dnum";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/compliance"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  const { asset } = useTokenLoaderQuery();

  const { t } = useTranslation("compliance-modules");
  const { getCountryByNumericCode } = useCountries();

  const { data: compliance } = useSuspenseQuery(
    orpc.token.compliance.queryOptions({
      input: { tokenAddress: asset.id },
    })
  );

  if (compliance.complianceModuleConfigs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-500">{t("noModules")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {compliance.complianceModuleConfigs.map((module) => {
        if (
          module.complianceModule.typeId ===
          "SMARTIdentityVerificationComplianceModule"
        ) {
          const expression =
            module.complianceModule.tokenConfigs[0]?.parameters.expression;
          if (!expression) {
            return null;
          }
          return (
            <DetailGrid
              key={module.complianceModule.typeId}
              title={t(`modules.${module.complianceModule.typeId}.title`)}
            >
              <ExpressionView
                expressionWithGroups={expression.map((node) => ({
                  nodeType: ExpressionTypeEnum[node.nodeType],
                  value: node.topicScheme
                    ? getTopicId(node.topicScheme?.name as ATKTopic)
                    : 0n,
                }))}
              />
            </DetailGrid>
          );
        }
        if (
          module.complianceModule.typeId === "TokenSupplyLimitComplianceModule"
        ) {
          const params = module.complianceModule.tokenConfigs[0]?.parameters;
          if (!params) {
            return null;
          }
          return (
            <DetailGrid
              key={module.complianceModule.typeId}
              title={t(`modules.${module.complianceModule.typeId}.title`)}
            >
              <DetailGridItem
                label={t(
                  `modules.${module.complianceModule.typeId}.details.maxSupplyLimit`
                )}
                type="currency"
                value={divide(
                  from(
                    params.tokenSupplyLimit?.maxSupplyExact ?? 0n,
                    asset.decimals
                  ),
                  10n ** BigInt(asset.decimals)
                )}
                currency={{ assetSymbol: asset.symbol }}
                emptyValue={"-"}
              />
            </DetailGrid>
          );
        }
        if (
          module.complianceModule.typeId ===
            "CountryAllowListComplianceModule" ||
          module.complianceModule.typeId === "CountryBlockListComplianceModule"
        ) {
          const countries =
            module.complianceModule.tokenConfigs[0]?.parameters.countries;
          if (!countries || countries.length === 0) {
            return null;
          }
          const countryNames = countries
            .map((country) => getCountryByNumericCode(country))
            .filter((country) => country !== undefined);
          return (
            <DetailGrid
              key={module.complianceModule.typeId}
              title={t(`modules.${module.complianceModule.typeId}.title`)}
            >
              {countryNames.join(", ")}
            </DetailGrid>
          );
        }
        return (
          <DetailGrid
            key={module.complianceModule.typeId}
            title={module.complianceModule.typeId}
          >
            <pre>{JSON.stringify(module, undefined, 2)}</pre>
          </DetailGrid>
        );
      })}
    </div>
  );
}
