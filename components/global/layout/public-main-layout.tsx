import type { FooterLink } from "@/components/global/layout/public-footer";
import { PublicFooter } from "@/components/global/layout/public-footer";
import { type NavItem, PublicHeader } from "@/components/global/layout/public-header";
import type { PropsWithChildren } from "react";

interface PublicMainLayoutProps extends PropsWithChildren {
  label?: string;
  footer: { links: FooterLink[] };
  header: {
    navItems: NavItem[];
    navButtonText: string;
    noNavButton?: boolean;
  };
}

export function PublicMainLayout({
  children,
  label,
  footer,
  header,
}: Readonly<PropsWithChildren<PublicMainLayoutProps>>) {
  return (
    <div className="flex flex-col min-h-[100dvh] relative">
      <PublicHeader
        label={label}
        navItems={header.navItems}
        navButtonText={header.navButtonText}
        noNavButton={header.noNavButton}
      />
      <main className="flex-grow">{children}</main>
      <PublicFooter footerLinks={footer?.links} />
    </div>
  );
}
