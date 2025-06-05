import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "next-intl";
import { KycMonitoringDashboard } from "./kyc-monitoring-dashboard";

interface KycMonitoringLayoutProps {
  locale: Locale;
}

export function KycMonitoringLayout({ locale }: KycMonitoringLayoutProps) {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>KYC Monitoring</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <KycMonitoringDashboard locale={locale} />
      </CardContent>
    </Card>
  );
}
