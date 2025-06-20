import { redirect } from "@/i18n/routing";
import type { Locale } from "next-intl";

export async function redirectToSignIn(locale: Locale): Promise<never> {
  return redirect({
    href: "/auth/sign-in",
    locale,
  });
}
