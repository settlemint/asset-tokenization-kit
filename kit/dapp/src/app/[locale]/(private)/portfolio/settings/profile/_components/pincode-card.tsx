"use client";

import { SetupPincodeDialog } from "@/components/blocks/auth/pincode/setup-pincode-dialog";
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

export function PincodeCard() {
  const t = useTranslations("portfolio.settings.profile.pincode");
  const { isPending } = authClient.useSession();
  const [isPincodeDialogOpen, setIsPincodeDialogOpen] = useState(false);
  const { data: session } = authClient.useSession();

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
        <SetupPincodeDialog
          open={isPincodeDialogOpen}
          onOpenChange={setIsPincodeDialogOpen}
        />
      </CardContent>
      <CardFooter className="flex items-center p-6 py-4 md:py-3 bg-transparent border-none justify-end">
        {session?.user?.pincodeEnabled ? (
          <Button
            onClick={() => setIsPincodeDialogOpen(true)}
            size="sm"
            disabled={!session?.user?.twoFactorEnabled}
          >
            {t("remove-pincode")}
          </Button>
        ) : (
          <Button onClick={() => setIsPincodeDialogOpen(true)} size="sm">
            {t("setup-pincode")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
