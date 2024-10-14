import { PublicNavigation } from "@/components/global/navigation/navigation-topbar";
import { Logo } from "@/components/public/logo";
import { Link } from "@/lib/i18n";
import type { PropsWithChildren } from "react";

export interface NavItem {
  href: string;
  label: string;
}

export function PublicHeader({
  children,
  noNavButton = false,
  label,
  navItems,
  navButtonText,
}: PropsWithChildren<{ noNavButton?: boolean; label?: string; navItems: NavItem[]; navButtonText?: string }>) {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center justify-between py-4">
      <Link href="/" className="flex items-center" aria-label={label}>
        <Logo />
      </Link>
      <PublicNavigation noNavButton={noNavButton} navItems={navItems} navButtonText={navButtonText} />
      {children}
    </header>
  );
}
