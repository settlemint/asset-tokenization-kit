import { PortfolioSidebar } from "@/app/[locale]/(private)/portfolio/_components/sidebar";
import NavInset from "@/components/layout/nav-inset";
import NavProvider from "@/components/layout/nav-provider";
import { getUser } from "@/lib/auth/utils";
import type { PropsWithChildren } from "react";

export default async function PortfolioLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  await getUser(locale, ["user", "admin", "issuer"]);

  return (
    <NavProvider>
      <PortfolioSidebar />
      <NavInset>{children}</NavInset>
    </NavProvider>
  );
}
