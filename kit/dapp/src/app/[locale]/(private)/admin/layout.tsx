import NavInset from "@/components/layout/nav-inset";
import NavProvider from "@/components/layout/nav-provider";
import { getUser } from "@/lib/auth/utils";
import type { PropsWithChildren } from "react";
import { AdminSidebar } from "./_components/sidebar/sidebar";

export default async function AdminLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  await getUser(locale, ["admin", "issuer"]);

  return (
    <NavProvider>
      <AdminSidebar />
      <NavInset>{children}</NavInset>
    </NavProvider>
  );
}
