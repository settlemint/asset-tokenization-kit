"use client";

import { StatusPill } from "@/components/blocks/status-pill/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { isAuthorized } from "@/lib/utils/mica";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EditForm } from "./_components/edit-form";

interface AuthorizationStatusLayoutProps {
  config?: MicaRegulationConfig | null;
  canEdit: boolean;
}

export function AuthorizationStatusLayout({
  config,
  canEdit,
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
              <div className="mt-4">
                <StatusPill
                  status={isAuthorized(config) ? "success" : "warning"}
                  label={t(
                    isAuthorized(config)
                      ? "authorized"
                      : "pending-authorization"
                  )}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button variant="default" onClick={() => setOpen(true)}>
                  {t("update")}
                </Button>
              )}
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
