import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getKycUserStats } from "@/lib/queries/user/kyc-user-stats";
import { formatNumber } from "@/lib/utils/number";
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle,
  Clock,
  Shield,
  Snowflake,
} from "lucide-react";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

interface KycMonitoringDashboardProps {
  locale: Locale;
}

export async function KycMonitoringDashboard({
  locale,
}: KycMonitoringDashboardProps) {
  const stats = await getKycUserStats();
  const t = await getTranslations("regulations.mica.dashboard.kyc-monitoring");

  return (
    <div className="">
      {/* Header with Active Monitoring badge */}
      <div className="flex items-center justify-between">
        <Badge className="!bg-success/80 !text-success-foreground border-transparent -mt-3">
          <CheckCircle className="mr-1 size-3" />
          {t("active-monitoring")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* User KYC Status */}
        <Card>
          <CardTitle className="text-base font-medium px-4">
            {t("user-kyc-status.title")}
          </CardTitle>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-green-100 dark:bg-green-900/20">
                  <Check className="size-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("user-kyc-status.verified-holders")}
                </span>
              </div>
              <span className="text-lg font-semibold">
                {formatNumber(stats.kycVerifiedCount, { locale })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                  <Clock className="size-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("user-kyc-status.pending-verification")}
                </span>
              </div>
              <span className="text-lg font-semibold">
                {formatNumber(stats.pendingVerificationCount, { locale })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-red-100 dark:bg-red-900/20">
                  <Ban className="size-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("user-kyc-status.blocked-holders")}
                </span>
              </div>
              <span className="text-lg font-semibold">
                {formatNumber(stats.blockedUsersCount, { locale })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Features */}
        <Card>
          <CardTitle className="text-base font-medium px-4">
            {t("compliance-features.title")}
          </CardTitle>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800">
                  <Shield className="size-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("compliance-features.address-blocklist")}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              >
                {t("compliance-features.enabled")}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800">
                  <Snowflake className="size-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("compliance-features.asset-freezing")}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              >
                {t("compliance-features.enabled")}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-gray-100 dark:bg-gray-800">
                  <AlertTriangle className="size-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("compliance-features.sanction-lists")}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              >
                {t("compliance-features.enabled")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
