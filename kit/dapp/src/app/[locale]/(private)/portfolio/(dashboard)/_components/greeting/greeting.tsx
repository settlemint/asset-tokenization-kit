"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { User } from "@/lib/auth/types";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { MyAssetsCount } from "../header/my-assets-count";

export function Greeting({
  totalUserAssetsValue,
  user,
}: {
  totalUserAssetsValue: number;
  user: User;
}) {
  const t = useTranslations("portfolio.greeting");
  const { resolvedTheme } = useTheme();

  const sidebarStyle = {
    backgroundImage:
      resolvedTheme === "dark"
        ? "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url('/backgrounds/sidebar-bg.png')"
        : "url('/backgrounds/sidebar-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "top",
    backgroundRepeat: "no-repeat",
  };

  return (
    <Card style={sidebarStyle}>
      <CardHeader className="font-semibold">
        {getGreeting(t)}! {t("you-have")}
      </CardHeader>
      <CardContent>
        <MyAssetsCount
          totalValue={{
            amount: totalUserAssetsValue,
            currency: user.currency,
          }}
        />
      </CardContent>
    </Card>
  );
}

function getGreeting(t: (key: "morning" | "afternoon" | "evening") => string) {
  const hour = new Date().getHours();
  if (hour < 12) {
    return t("morning");
  }
  if (hour < 17) {
    return t("afternoon");
  }
  return t("evening");
}
