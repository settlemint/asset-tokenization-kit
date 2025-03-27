"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { CopyToClipboard } from "../../../../../../../components/blocks/copy/copy";

export function TwoFactorCard() {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication"
  );
  const { data: session, isPending } = authClient.useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isEnteringPassword, setIsEnteringPassword] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    totpURI: string;
    backupCodes: string[];
  } | null>(null);
  const [firstOtp, setFirstOtp] = useState("");

  const enableTwoFactorAuthentication = async () => {
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
      setPassword("");
      setIsEnteringPassword(false);
      setIsLoading(false);
    }
  };

  const disableTwoFactorAuthentication = async () => {
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
      setPassword("");
      setIsEnteringPassword(false);
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async () => {
    if (session?.user.twoFactorEnabled) {
      await disableTwoFactorAuthentication();
    } else {
      await enableTwoFactorAuthentication();
    }
  };

  const onMfaSetupFinished = async () => {
    try {
      setIsLoading(true);
      const { error } = await authClient.twoFactor.verifyTotp({
        code: firstOtp,
      });
      if (error) {
        toast.error(
          t("enable.error-message", {
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
      } else {
        setFirstOtp("");
        setTwoFactorData(null);
        toast.success(t("enable.success-message"));
      }
    } catch (error) {
      toast.error(
        t("enable.error-message", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
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
      <Dialog open={isEnteringPassword} onOpenChange={setIsEnteringPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("enable.enter-password-title")}</DialogTitle>
            <DialogDescription>
              {t("enable.enter-password-description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder={t("enable.enter-password-placeholder")}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && password.trim()) {
                  e.preventDefault();
                  onPasswordSubmit();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEnteringPassword(false);
              }}
              disabled={isLoading}
            >
              {t("enable.enter-password-cancel")}
            </Button>
            <Button
              variant={
                session?.user.twoFactorEnabled ? "destructive" : "default"
              }
              onClick={(e) => {
                e.preventDefault();
                onPasswordSubmit();
              }}
              disabled={!password.trim() || isLoading}
            >
              {isLoading
                ? t("enable.enter-password-submit-loading")
                : t("enable.enter-password-submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!twoFactorData}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setTwoFactorData(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("setup-mfa.title")}</DialogTitle>
            <DialogDescription>{t("setup-mfa.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center w-full">
              <QRCode
                className="rounded-md bg-muted p-4"
                value={twoFactorData?.totpURI ?? ""}
                size={256}
              />
            </div>
            <label className="flex justify-center w-full text-md font-semibold">
              {t("setup-mfa.enter-code-title")}
            </label>
            <div className="flex justify-center w-full pb-6">
              <InputOTP maxLength={6} value={firstOtp} onChange={setFirstOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTwoFactorData(null);
              }}
              disabled={isLoading}
            >
              {t("setup-mfa.cancel")}
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onMfaSetupFinished();
              }}
              disabled={!firstOtp.trim() || isLoading}
            >
              {isLoading
                ? t("setup-mfa.enable-loading")
                : t("setup-mfa.enable")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
