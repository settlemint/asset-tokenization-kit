"use client";

import { SetupTwoFactorDialog } from "@/components/blocks/auth/two-factor/setup-two-factor-dialog";
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
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { TwoFactorBackupCodesDialog } from "./two-factor-backup-codes-dialog";
import { TwoFactorPasswordDialog } from "./two-factor-password-dialog";

export function TwoFactorCard() {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication"
  );
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isBackupCodesDialogOpen, setIsBackupCodesDialogOpen] = useState(false);

  const disableTwoFactorAuthentication = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await authClient.twoFactor.disable({
        password,
      });
      if (error) {
        toast.error(
          t("disable.error-message", {
            error: error.message ?? "Unknown error",
          })
        );
      } else {
        toast.success(t("disable.success-message"));
        router.refresh();
      }
    } catch (error) {
      toast.error(
        t("disable.error-message", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsDisabling(false);
      setIsLoading(false);
    }
  };

  if (isPending) {
    return <Skeleton />;
  }

  return (
    <>
      <Card className="bg-card text-card-foreground rounded-xl border shadow-sm w-full overflow-hidden pt-6 pb-0">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">{t("title")}</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 flex-1">
          {session?.user.twoFactorEnabled ? (
            <>
              <div>{t("status.enabled")}</div>
              <div>
                <TwoFactorBackupCodesDialog
                  open={isBackupCodesDialogOpen}
                  onOpenChange={setIsBackupCodesDialogOpen}
                />
                <Button
                  variant="secondary"
                  onClick={() => setIsBackupCodesDialogOpen(true)}
                  size="sm"
                >
                  {t("backup-codes.generate")}
                </Button>
              </div>
            </>
          ) : (
            t("status.disabled")
          )}
        </CardContent>
        <CardFooter className="flex items-center p-6 py-4 md:py-3 bg-transparent border-none justify-end">
          <Button
            onClick={() =>
              session?.user.twoFactorEnabled
                ? setIsDisabling(true)
                : setIsEnabling(true)
            }
            disabled={isLoading}
            size="sm"
          >
            {session?.user.twoFactorEnabled
              ? t("disable.title")
              : t("enable.title")}
          </Button>
        </CardFooter>
      </Card>
      <TwoFactorPasswordDialog
        open={isDisabling}
        onOpenChange={setIsDisabling}
        onSubmit={disableTwoFactorAuthentication}
        isLoading={isLoading}
        submitButtonVariant="destructive"
        submitButtonText={t("disable.title")}
      />
      <SetupTwoFactorDialog onOpenChange={setIsEnabling} open={isEnabling} />
    </>
  );
}
