import NavInset from "@/components/layout/nav-inset";
import NavProvider from "@/components/layout/nav-provider";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { AdminSidebar } from "./_components/sidebar/sidebar";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "admin.users",
  });

  return {
    title: t("page-title"),
    description: t("page-description"),
  };
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <NavProvider>
          <AdminSidebar />
          <NavInset>{children}</NavInset>
        </NavProvider>
      </SignedIn>
    </>
  );
}
