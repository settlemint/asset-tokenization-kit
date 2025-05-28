"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EditForm } from "./_components/edit-form";

interface AuthorizationStatusLayoutProps {
  config?: MicaRegulationConfig | null;
}

function isAuthorized(config: MicaRegulationConfig): boolean {
  return !!(
    config.licenceNumber &&
    config.regulatoryAuthority &&
    config.approvalDate
  );
}

export function AuthorizationStatusLayout({
  config,
}: AuthorizationStatusLayoutProps) {
  const t = useTranslations("regulations.mica.dashboard.authorization-status");
  const [open, setOpen] = useState(false);

  if (!config) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {t("no-authorization-data")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <Badge
                className={`mt-4 ${
                  isAuthorized(config)
                    ? "!bg-success/80 !text-success-foreground"
                    : "!bg-warning/80 !text-warning-foreground"
                } border-transparent`}
              >
                {isAuthorized(config) ? (
                  <CheckCircle className="mr-1 size-3" />
                ) : (
                  <AlertCircle className="mr-1 size-3" />
                )}
                {t(
                  isAuthorized(config) ? "authorized" : "pending-authorization"
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" onClick={() => setOpen(true)}>
                {t("update")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-6">
          <div>
            <h3 className="text-muted-foreground text-sm">
              {t("license-number")}
            </h3>
            {config.licenceNumber ?? "-"}
          </div>
          <div>
            <h3 className="text-muted-foreground text-sm">
              {t("regulatory-authority")}
            </h3>
            <p>{config.regulatoryAuthority ?? "-"}</p>
          </div>
          <div>
            <h3 className="text-muted-foreground text-sm">
              {t("approval-date")}
            </h3>
            <p>
              {config.approvalDate
                ? new Date(config.approvalDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <h3 className="text-muted-foreground text-sm">
              {t("additional-details")}
            </h3>
            <p>{config.approvalDetails ?? "-"}</p>
          </div>
          <EditForm config={config} open={open} onOpenChange={setOpen} />
        </CardContent>
      </Card>
    </>
  );
}
