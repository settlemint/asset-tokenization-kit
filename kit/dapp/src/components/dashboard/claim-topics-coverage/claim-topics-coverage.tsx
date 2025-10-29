import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ClaimTopicsCoverage() {
  const { t } = useTranslation("dashboard");

  const { data } = useSuspenseQuery(
    orpc.system.stats.topicSchemeClaimsCoverage.queryOptions()
  );

  const { totalActiveTopicSchemes, missingTopics } = data;
  const missingCount = missingTopics.length;
  const coveredCount = totalActiveTopicSchemes - missingCount;
  const coveragePercentage =
    totalActiveTopicSchemes > 0
      ? (coveredCount / totalActiveTopicSchemes) * 100
      : 0;

  const hasMissingTopics = missingCount > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("claimTopicsCoverage.title")}
          {hasMissingTopics && <AlertCircle className="text-warning size-4" />}
          {!hasMissingTopics && <CircleCheck className="text-success size-4" />}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alert for coverage status */}
        {hasMissingTopics ? (
          <Alert className="border-warning/50 text-warning">
            <AlertCircle className="size-4" />
            <AlertTitle>
              {t("claimTopicsCoverage.missingCoverage", {
                count: missingCount,
              })}
            </AlertTitle>
            <AlertDescription className="text-warning/90">
              {t("claimTopicsCoverage.missingCoverageDescription")}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-500/50 bg-green-500/5 text-green-700 dark:text-green-400">
            <CircleCheck className="size-4" />
            <AlertTitle>{t("claimTopicsCoverage.allTopicsCovered")}</AlertTitle>
          </Alert>
        )}

        {/* Coverage stats - only show when there are missing topics */}
        {hasMissingTopics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                {t("claimTopicsCoverage.coverage")}
              </span>
              <span className="text-lg font-semibold">
                {coveragePercentage.toFixed(1)}%
              </span>
            </div>

            {/* Progress bar with segments */}
            <div className="relative h-8 overflow-hidden rounded-md border bg-muted">
              {/* Covered segment (success) */}
              {coveredCount > 0 && (
                <div
                  className="absolute left-0 top-0 flex h-full items-center justify-center bg-green-600 text-xs font-medium text-white transition-all dark:bg-green-500"
                  style={{
                    width: `${
                      totalActiveTopicSchemes > 0
                        ? (coveredCount / totalActiveTopicSchemes) * 100
                        : 0
                    }%`,
                  }}
                >
                  <span className="px-2">
                    {t("claimTopicsCoverage.covered", {
                      count: coveredCount,
                    })}
                  </span>
                </div>
              )}

              {/* Missing segment (warning) */}
              {missingCount > 0 && (
                <div
                  className="absolute right-0 top-0 flex h-full items-center justify-center bg-amber-500 text-xs font-medium text-white transition-all dark:bg-amber-600"
                  style={{
                    width: `${
                      totalActiveTopicSchemes > 0
                        ? (missingCount / totalActiveTopicSchemes) * 100
                        : 0
                    }%`,
                  }}
                >
                  <span className="px-2">
                    {t("claimTopicsCoverage.missing", {
                      count: missingCount,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Missing topics list */}
        {hasMissingTopics && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {t("claimTopicsCoverage.missingTopicsLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {missingTopics.map((topic) => (
                <Badge
                  key={topic.id}
                  className="border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                >
                  {topic.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link
          to="/platform-settings/claim-topics-issuers"
          className="text-primary hover:text-primary/90 inline-flex items-center gap-1 text-sm font-medium transition-colors"
        >
          {t("claimTopicsCoverage.manageClaimTopics")}
          <ArrowRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
