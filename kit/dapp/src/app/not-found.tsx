"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotFoundPage() {
  const router = useRouter();
  const t = useTranslations("not-found");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <FileQuestion className="size-6 text-muted-foreground" />
      </div>
      <h1 className="font-semibold text-2xl tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <div className="flex gap-4">
        <Button onClick={() => router.back()} variant="default">
          {t("go-back")}
        </Button>
        <Button onClick={() => router.push("/")} variant="outline">
          {t("go-home")}
        </Button>
      </div>
    </div>
  );
}
