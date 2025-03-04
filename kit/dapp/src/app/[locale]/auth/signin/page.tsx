import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignInForm } from "./forms/signin-form";

interface SignInPageProps {
  searchParams: Promise<{
    rd?: string;
  }>;
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: SignInPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "auth.signin",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SignIn({
  searchParams,
  params,
}: SignInPageProps) {
  const { rd } = await searchParams;
  const { locale } = await params;

  return (
    <>
      <div className="w-full">
        <SignInForm
          redirectUrl={decodeURIComponent(rd || "")}
          locale={locale}
        />
      </div>
    </>
  );
}
