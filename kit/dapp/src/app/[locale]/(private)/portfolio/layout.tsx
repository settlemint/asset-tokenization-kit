import { PortfolioSidebar } from "@/app/[locale]/(private)/portfolio/_components/sidebar";
import NavInset from "@/components/layout/nav-inset";
import NavProvider from "@/components/layout/nav-provider";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import type { PropsWithChildren } from "react";

export default function PortfolioLayout({ children }: PropsWithChildren) {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <NavProvider>
          <PortfolioSidebar />
          <NavInset>{children}</NavInset>
        </NavProvider>
      </SignedIn>
    </>
  );
}
