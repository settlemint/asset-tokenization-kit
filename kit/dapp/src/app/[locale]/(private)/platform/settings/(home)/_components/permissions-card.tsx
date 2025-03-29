"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface PermissionsCardProps {
  adminCount: number;
}

export function PermissionsCard({ adminCount }: PermissionsCardProps) {
  const t = useTranslations("admin.platform.settings");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Users className="size-4" />
          </div>
          <div>
            <CardTitle>{t("permissions-title")}</CardTitle>
            <CardDescription>{t("permissions-description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div>
            <div className="flex flex-col gap-4 justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-foreground">
                  {t("admin-count", { count: adminCount })}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {adminCount}
                </span>
              </div>
              <Link
                className="text-accent hover:underline"
                href="/platform/admins"
              >
                {t("manage-admins")}
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
