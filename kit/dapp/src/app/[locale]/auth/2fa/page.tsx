"use client";

import { TwoFactorOTPInput } from "@/components/blocks/auth/two-factor/two-factor-otp-input";
import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { authClient } from "@/lib/auth/client";
import type { VerifyTwoFactorOTPInput } from "@/lib/mutations/user/two-factor/verify-two-factor-otp-schema";
import { VerifyTwoFactorOTPSchema } from "@/lib/mutations/user/two-factor/verify-two-factor-otp-schema";
import { AuthUIContext } from "@daveyplate/better-auth-ui";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function TwoFactorAuthPage() {
  const { data: sessionData } = authClient.useSession();
  const t = useTranslations("auth-2fa");
  const form = useForm<VerifyTwoFactorOTPInput>({
    resolver: typeboxResolver(VerifyTwoFactorOTPSchema()),
  });
  const { navigate } = useContext(AuthUIContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect = useCallback(() => {
    const redirectTo = new URLSearchParams(window.location.search).get(
      "redirectTo"
    );
    navigate(redirectTo ?? "/portfolio");
  }, [navigate]);

  const onSubmit = () => {
    return new Promise<void>((resolve, reject) => {
      setIsSubmitting(true);
      authClient.twoFactor.verifyTotp(
        { code: form.getValues("code").toString() },
        {
          onSuccess() {
            redirect();
            resolve();
          },
          onError() {
            toast.error(t("error"));
            reject(new Error("Failed to verify 2FA"));
            setIsSubmitting(false);
          },
        }
      );
    });
  };

  useEffect(() => {
    if (sessionData) {
      redirect();
    }
  }, [redirect, sessionData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TwoFactorOTPInput
                      value={field.value?.toString() ?? ""}
                      onChange={field.onChange}
                      autoFocus
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <TranslatableFormFieldMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
