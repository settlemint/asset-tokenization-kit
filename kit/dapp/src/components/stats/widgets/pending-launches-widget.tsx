import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format-value/format-number";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/**
 * Pending Launches Statistics Widget
 *
 * Shows how many tokens are awaiting launch by comparing created vs launched counts.
 * Relies on the cached asset stats query to avoid duplicate network requests.
 */
export function PendingLaunchesWidget() {
  const { t } = useTranslation("stats");
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const { data: metrics } = useSuspenseQuery(
    orpc.system.stats.assets.queryOptions({ input: {} })
  );

  const pendingLaunches = formatNumber(
    metrics.pendingLaunchesCount,
    {
      type: "number",
    },
    locale
  );
  const createdCount = formatNumber(
    metrics.tokensCreatedCount,
    {
      type: "number",
    },
    locale
  );
  const launchedCount = formatNumber(
    metrics.tokensLaunchedCount,
    {
      type: "number",
    },
    locale
  );

  return (
    <ComponentErrorBoundary componentName="Pending Launches Widget">
      <Card>
        <CardHeader>
          <CardTitle>{t("widgets.pendingLaunches.title")}</CardTitle>
        </CardHeader>
        <CardContent className="font-bold text-3xl">
          {pendingLaunches}
        </CardContent>
        <CardFooter className="text-muted-foreground text-sm">
          {t("widgets.pendingLaunches.description", {
            created: createdCount,
            launched: launchedCount,
          })}
        </CardFooter>
      </Card>
    </ComponentErrorBoundary>
  );
}
