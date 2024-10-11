import { SecureMainLayout } from "@/components/global/layout/secure-main-layout";
import type { NavItemType } from "@/components/global/navigation/navigation-item";
import { Coins, HelpCircle, LineChart, ShoppingCart } from "lucide-react";
import type { PropsWithChildren } from "react";
import type { BreadcrumbItemType } from "../global/breadcrumb/ellipsis-dropdown";

const breadcrumbItems: BreadcrumbItemType[] = [{ label: "Dashboard" }];

const navItems: Record<string, NavItemType[]> = {
  main: [
    { icon: <LineChart className="h-4 w-4" />, label: "Dashboard", href: "/wallet" },
    { icon: <Coins className="h-4 w-4" />, label: "Tokens", href: "/wallet/tokens" },
    { icon: <ShoppingCart className="h-4 w-4" />, label: "Orders", href: "/wallet/orders", badge: 6 },
  ],
  footer: [
    {
      icon: <HelpCircle className="h-4 w-4" />,
      label: "Docs",
      href: "https://console.settlemint.com/documentation",
    },
  ],
};

export function WalletMainLayout({ children }: PropsWithChildren) {
  return (
    <SecureMainLayout
      breadcrumbItems={[{ label: "Asset Tokenization", href: "/wallet" }, ...(breadcrumbItems ?? [])]}
      navItems={navItems}
    >
      {children}
    </SecureMainLayout>
  );
}
