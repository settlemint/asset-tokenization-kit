"use client";
import { TwoFactorOTPInput } from "@/components/blocks/auth/two-factor-otp-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth/client";
import type { VerifyTwoFactorOTPInput } from "@/lib/mutations/user/verify-two-factor-otp-schema";
import { VerifyTwoFactorOTPSchema } from "@/lib/mutations/user/verify-two-factor-otp-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function TwoFactorAuthPage() {
  const t = useTranslations("auth-2fa");
  const form = useForm<VerifyTwoFactorOTPInput>({
    resolver: typeboxResolver(VerifyTwoFactorOTPSchema()),
  });

  const onSubmit = () => {
    authClient.twoFactor.verifyTotp(
      { code: form.getValues("code").toString() },
      {
        onSuccess() {
          window.location.href = "/en/portfolio";
        },
        onError() {
          toast.error(t("error"));
        },
      }
    );
  };

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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
