"use client";

import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormOtp } from "@/components/blocks/form/inputs/form-otp";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Link } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(1, "Name is required"),
    walletPincode: z.string().length(6, "PIN code must be exactly 6 digits"),
    walletPincodeConfirm: z
      .string()
      .length(6, "PIN code must be exactly 6 digits"),
  })
  .refine((data) => data.walletPincode === data.walletPincodeConfirm, {
    message: "PIN codes don't match",
    path: ["walletPincodeConfirm"],
  });

const SetPinCode = portalGraphql(`
  mutation SetPinCode($name: String!, $address: String!, $pincode: String!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: {pincode: {name: $name, pincode: $pincode}}
    ) {
      id
      name
      parameters
      verificationType
    }
  }
`);

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm({
  className,
  redirectUrl = "/",
  locale,
  ...props
}: ComponentPropsWithoutRef<"form"> & {
  redirectUrl?: string;
  locale: string;
}) {
  const t = useTranslations("auth.signup");
  const decodedRedirectUrl = decodeURIComponent(redirectUrl);
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      walletPincode: "",
      walletPincodeConfirm: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        wallet: "", // will be filled in by the hook
      },
      {
        onSuccess: async () => {
          try {
            const session = await authClient.getSession();
            if (!session.data?.user.wallet) {
              form.setError("root", {
                message: "No wallet address found",
              });
              return;
            }
            await portalClient.request(SetPinCode, {
              name: data.name,
              address: session.data.user.wallet,
              pincode: data.walletPincode,
            });
            // Check user role and redirect accordingly
            const userRole = session.data.user.role;
            const isAdminOrIssuer =
              userRole === "issuer" || userRole === "admin";
            const adminRedirect =
              decodedRedirectUrl.trim() || `/${locale}/admin`;
            const targetUrl = isAdminOrIssuer ? adminRedirect : "/portfolio";
            // Force a full page refresh to ensure new auth state is recognized
            window.location.replace(targetUrl);
          } catch (err) {
            const error = err as Error;
            form.setError("root", {
              message: `Unexpected error: ${error.message}`,
            });
          }
        },
        onError: (ctx) => {
          form.setError("root", {
            message: ctx.error.message,
          });
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(onSubmit)(e);
        }}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-2xl">{t("title")}</h1>
          <p className="text-balance text-muted-foreground text-sm">
            {t("description")}
          </p>
        </div>
        {form.formState.errors.root && (
          <Alert
            variant="destructive"
            className="text-destructive border-destructive"
          >
            <AlertTitle>
              {form.formState.errors.root.message?.toString() ||
                t("error.generic")}
            </AlertTitle>
          </Alert>
        )}
        <div className="grid gap-6">
          <FormInput
            control={form.control}
            name="name"
            label={t("name.label")}
            placeholder={t("name.placeholder")}
            autoComplete="name"
            required
          />
          <FormInput
            control={form.control}
            name="email"
            label={t("email.label")}
            type="email"
            placeholder={t("email.placeholder")}
            autoComplete="email"
            required
          />
          <FormInput
            control={form.control}
            name="password"
            label={t("password.label")}
            type="password"
            autoComplete="new-password"
            required
          />
          <FormOtp
            control={form.control}
            name="walletPincode"
            label={t("wallet-pin.label")}
            data-testid="wallet-pin-input"
          />
          <FormOtp
            control={form.control}
            name="walletPincodeConfirm"
            label={t("wallet-pin-confirm.label")}
            data-testid="wallet-pin-confirm-input"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("have-account")}{" "}
          <Link
            locale={locale}
            href={`/auth/signin?rd=${decodedRedirectUrl}`}
            className="underline underline-offset-4"
          >
            {t("sign-in")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
