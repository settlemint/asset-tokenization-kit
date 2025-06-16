"use client";

import { PasswordDialog } from "@/components/blocks/auth/password-dialog";
import { SetupTwoFactorDialog } from "@/components/blocks/auth/two-factor/setup-two-factor-dialog";
import { Alert, AlertTitle } from "@/components/ui/alert";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function TwoFactorCard() {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication"
  );
  const { data: session, isPending } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const disableTwoFactorAuthentication = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await authClient.twoFactor.disable({
        password,
      });
      if (error) {
        throw new Error(error.message);
      }
      toast.success(t("disable.success-message"));
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
          <Alert
            className={cn(
              "mb-4",
              session?.user.twoFactorEnabled
                ? "bg-success/20 text-success-foreground border-success"
                : "bg-primary/20 text-primary-foreground border-primary"
            )}
          >
            <AlertTitle>
              {session?.user.twoFactorEnabled
                ? t("status.enabled")
                : t("status.disabled")}
            </AlertTitle>
          </Alert>
        </CardContent>
        <CardFooter className="flex items-center p-6 py-4 md:py-3 bg-transparent border-none justify-end">
          {session?.user.twoFactorEnabled ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      onClick={() => setIsDisabling(true)}
                      disabled={
                        isLoading || !(session?.user.pincodeEnabled ?? false)
                      }
                      variant="destructive"
                      size="sm"
                    >
                      {t("disable.title")}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!(session?.user.pincodeEnabled ?? false) && (
                  <TooltipContent>
                    <p>{t("disable.disable-two-factor-tooltip")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              onClick={() => setIsEnabling(true)}
              disabled={isLoading}
              size="sm"
            >
              {t("enable.title")}
            </Button>
          )}
        </CardFooter>
      </Card>
      <PasswordDialog
        open={isDisabling}
        onOpenChange={setIsDisabling}
        onSubmit={disableTwoFactorAuthentication}
        isLoading={isLoading}
        submitButtonVariant="destructive"
        submitButtonText={t("disable.title")}
        description={t("disable.password-description")}
      />
      <SetupTwoFactorDialog onOpenChange={setIsEnabling} open={isEnabling} />
    </>
  );
}
