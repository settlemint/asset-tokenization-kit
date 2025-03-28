"use client";

import { CopyToClipboard } from "@/components/blocks/copy/copy";
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
import { toast } from "sonner";
import { SetupTwoFactorDialog } from "./SetupTwoFactorDialog";
import { TwoFactorPasswordDialog } from "./TwoFactorPasswordDialog";

export function TwoFactorCard() {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication"
  );
  const { data: session, isPending } = authClient.useSession();

  const [isLoading, setIsLoading] = useState(false);

  const [isEnteringPassword, setIsEnteringPassword] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    totpURI: string;
    backupCodes: string[];
  } | null>(null);

  const enableTwoFactorAuthentication = async (password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await authClient.twoFactor.enable({
        password,
      });
      if (error) {
        toast.error(
          t("enable.error-message", {
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
      } else {
        setTwoFactorData(data);
      }
    } catch (error) {
      toast.error(
        t("enable.error-message", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsEnteringPassword(false);
      setIsLoading(false);
    }
  };

  const disableTwoFactorAuthentication = async (password: string) => {
    try {
      setIsLoading(true);
      await authClient.twoFactor.disable({
        password,
      });
      toast.success(t("disable.success-message"));
    } catch (error) {
      toast.error(
        t("disable.error-message", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsEnteringPassword(false);
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (password: string) => {
    if (session?.user.twoFactorEnabled) {
      await disableTwoFactorAuthentication(password);
    } else {
      await enableTwoFactorAuthentication(password);
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
              {t("status.enabled")}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">
                  {t("setup-mfa.backup-codes-title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("setup-mfa.backup-codes-description")}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {twoFactorData?.backupCodes.map((code) => (
                    <li key={code}>{code}</li>
                  ))}
                </ul>
              </div>
              <Button variant="secondary" size="sm">
                <div>{t("setup-mfa.backup-codes-copy")}</div>
                <CopyToClipboard
                  value={twoFactorData?.backupCodes.join("\n") ?? ""}
                  successMessage={t("setup-mfa.backup-codes-copied")}
                />
              </Button>
            </>
          ) : (
            t("status.disabled")
          )}
        </CardContent>
        <CardFooter className="flex items-center p-6 py-4 md:py-3 bg-transparent border-none justify-end">
          <Button
            onClick={() => setIsEnteringPassword(true)}
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
        open={isEnteringPassword}
        onOpenChange={setIsEnteringPassword}
        onSubmit={onPasswordSubmit}
        isLoading={isLoading}
        twoFactorEnabled={session?.user.twoFactorEnabled ?? false}
      />
      <SetupTwoFactorDialog
        totpURI={twoFactorData?.totpURI ?? null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setTwoFactorData(null);
          }
        }}
        open={!!twoFactorData}
      />
    </>
  );
}
