"use client";

import { RemovePincodeDialog } from "@/components/blocks/auth/pincode/remove-pincode-dialog";
import { SetupPincodeDialog } from "@/components/blocks/auth/pincode/setup-pincode-dialog";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PincodeCard() {
  const t = useTranslations("portfolio.settings.profile.pincode");
  const { isPending, data: session } = authClient.useSession();
  const [isPincodeDialogOpen, setIsPincodeDialogOpen] = useState(false);
  const [isRemovePincodeDialogOpen, setIsRemovePincodeDialogOpen] =
    useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    authClient
      .getSession({
        query: {
          // Don't use the cookie cache, some setting like pincode are not updated in the cookie (only after logout/login)
          disableCookieCache: true,
        },
      })
      .then((result) => {
        setIsEnabled(result.data?.user.pincodeEnabled ?? false);
      })
      .catch((error) => {
        console.error(error);
        toast.error(t("error"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [t]);

  if (isPending || isLoading) {
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
        <Alert
          className={cn(
            "mb-4",
            isEnabled
              ? "bg-success/20 text-success-foreground border-success"
              : "bg-primary/20 text-primary-foreground border-primary"
          )}
        >
          <AlertTitle>
            {isEnabled ? t("status.enabled") : t("status.disabled")}
          </AlertTitle>
        </Alert>
        <SetupPincodeDialog
          open={isPincodeDialogOpen}
          onOpenChange={setIsPincodeDialogOpen}
        />
        <RemovePincodeDialog
          open={isRemovePincodeDialogOpen}
          onOpenChange={setIsRemovePincodeDialogOpen}
        />
      </CardContent>
      <CardFooter className="flex items-center p-6 py-4 md:py-3 bg-transparent border-none justify-end space-x-2">
        {isEnabled ? (
          <>
            <Button onClick={() => setIsPincodeDialogOpen(true)} size="sm">
              {t("update-pincode.title")}
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      onClick={() => setIsRemovePincodeDialogOpen(true)}
                      size="sm"
                      disabled={!session?.user?.twoFactorEnabled}
                      variant="destructive"
                    >
                      {t("remove-pincode.title")}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!session?.user?.twoFactorEnabled && (
                  <TooltipContent>
                    <p>{t("remove-pincode.remove-pincode-tooltip")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <Button onClick={() => setIsPincodeDialogOpen(true)} size="sm">
            {t("setup-pincode.title")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
