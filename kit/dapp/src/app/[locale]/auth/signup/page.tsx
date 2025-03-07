import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignUpForm } from "./forms/signup-form";

interface SignUpPageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: SignUpPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "auth.signup",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SignUp({
  searchParams,
  params,
}: SignUpPageProps) {
  const { rd } = await searchParams;
  const { locale } = await params;
  const t = await getTranslations("auth.signup.page");

  return (
    <>
      <div className="w-full">
        <SignUpForm redirectUrl={rd} locale={locale} />
      </div>
      <Alert className="mt-8 bg-warning text-warning-foreground">
        <AlertTriangle className="size-4" />
        <AlertTitle>{t("alert.title")}</AlertTitle>
        <AlertDescription className="text-warning-foreground">
          {t("alert.description")}
        </AlertDescription>
      </Alert>
    </>
  );
}
