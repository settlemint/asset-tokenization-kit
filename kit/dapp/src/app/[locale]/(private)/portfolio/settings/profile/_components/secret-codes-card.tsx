"use client";

import { SecretCodesDialog } from "@/components/blocks/auth/secret-codes/secret-codes-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function SecretCodesCard() {
  const t = useTranslations("portfolio.settings.profile.secret-codes");
  const { isPending } = authClient.useSession();
  const [isSecretCodesDialogOpen, setIsSecretCodesDialogOpen] = useState(false);

  if (isPending) {
    return <Skeleton />;
  }

  return (
    <Card className="bg-card text-card-foreground rounded-xl border shadow-sm w-full overflow-hidden pt-6 pb-0">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{t("title")}</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <SecretCodesDialog
          open={isSecretCodesDialogOpen}
          onOpenChange={setIsSecretCodesDialogOpen}
        />
      </CardContent>
      <CardFooter className="flex items-center p-6 py-4 md:py-3 bg-transparent border-none justify-end">
        <Button
          variant="secondary"
          onClick={() => setIsSecretCodesDialogOpen(true)}
          size="sm"
        >
          {t("generate")}
        </Button>
      </CardFooter>
    </Card>
  );
}
