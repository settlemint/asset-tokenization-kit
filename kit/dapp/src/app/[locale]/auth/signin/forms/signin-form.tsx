"use client";

import { FormCheckbox } from "@/components/blocks/form/inputs/form-checkbox";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FingerprintIcon } from "@/components/ui/animated-icons/fingerprint";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Link } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm({
  className,
  redirectUrl = "/",
  locale,
  ...props
}: ComponentPropsWithoutRef<"form"> & {
  redirectUrl?: string;
  locale: string;
}) {
  const t = useTranslations("auth.signin");
  const decodedRedirectUrl = decodeURIComponent(redirectUrl);
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    await authClient.signIn.email(data, {
      onSuccess: async () => {
        const session = await authClient.getSession();
        const userRole = session.data?.user.role;
        const isAdminOrIssuer = userRole === "issuer" || userRole === "admin";
        const adminRedirect = decodedRedirectUrl.trim() || `/${locale}/admin`;
        const targetUrl = isAdminOrIssuer ? adminRedirect : "/portfolio";
        window.location.replace(targetUrl);
      },
      onError: (ctx) => {
        form.setError("root", {
          message: ctx.error.message,
        });
      },
    });
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
            className="border-destructive text-destructive"
          >
            <AlertTitle>{form.formState.errors.root.message}</AlertTitle>
          </Alert>
        )}
        <div className="grid gap-6">
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
            autoComplete="current-password"
            required
          />
          <FormCheckbox
            control={form.control}
            name="rememberMe"
            label={t("remember-me")}
            className="items-center space-x-2"
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
          <div className="text-center text-sm text-muted-foreground">OR</div>
          <Button
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              authClient.signIn
                .passkey()
                .then((result) => {
                  if (result?.error) {
                    toast.error(result.error.message);
                  }
                  authClient
                    .getSession()
                    .then((session) => {
                      const userRole = session.data?.user.role;
                      const isAdminOrIssuer =
                        userRole === "issuer" || userRole === "admin";
                      const adminRedirect =
                        decodedRedirectUrl.trim() || `/${locale}/admin`;
                      const targetUrl = isAdminOrIssuer
                        ? adminRedirect
                        : "/portfolio";
                      window.location.replace(targetUrl);
                    })
                    .catch((error) => {
                      toast.error(error);
                    });
                })
                .catch((error) => {
                  toast.error(error);
                });
            }}
          >
            <FingerprintIcon size={16} className="mr-2" />
            Sign in with passkey
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("no-account")}{" "}
          <Link
            href={`/auth/signup?rd=${decodedRedirectUrl}`}
            className="underline underline-offset-4"
          >
            {t("sign-up")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
