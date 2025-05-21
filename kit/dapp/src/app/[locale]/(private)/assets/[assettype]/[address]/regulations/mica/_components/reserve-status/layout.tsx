"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { Address } from "viem";
import { ReserveForm } from "./edit-form/form";

export function ReserveStatusLayout() {
  const t = useTranslations("regulations.mica.dashboard.reserve-status");
  const params = useParams<{ address: Address }>();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <ReserveForm address={params.address} />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">{/* TODO: Add content */}</div>
      </CardContent>
    </Card>
  );
}
