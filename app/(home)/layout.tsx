import { PublicMainLayout } from "@/components/global/layout/public-main-layout";
import * as m from "@/paraglide/messages.js";
import type { PropsWithChildren } from "react";

export interface NavItem {
  href: string;
  label: string;
}

export default function HomeLayout({ children }: Readonly<PropsWithChildren>) {
  const footerLinks = [
    {
      href: "https://console.settlemint.com/documentation/docs/terms-and-policies/terms-of-service/",
      label: m.awful_dirty_marten_drip(),
    },
    {
      href: "https://console.settlemint.com/documentation/docs/terms-and-policies/privacy-policy/",
      label: m.even_dark_parakeet_climb(),
    },
    {
      href: "https://console.settlemint.com/documentation/docs/terms-and-policies/cookie-policy/",
      label: m.tidy_key_bulldog_grin(),
    },
  ];

  const navItems: NavItem[] = [
    { href: "https://settlemint.com", label: m.strong_away_mouse_dine() },
    { href: "https://console.settlemint.com/documentation", label: m.alive_last_starfish_find() },
    { href: "https://console.settlemint.com", label: m.super_polite_porpoise_love() },
  ];

  return (
    <PublicMainLayout
      label="SettleMint Asset Tokenization Starterkit"
      header={{ navItems, navButtonText: "Go to the dApp" }}
      footer={{ links: footerLinks }}
    >
      {children}
    </PublicMainLayout>
  );
}
