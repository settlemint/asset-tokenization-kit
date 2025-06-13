import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";

export async function redirectToSignIn(locale: Locale): Promise<never> {
  return redirect({
    href: "/auth/sign-in",
    locale,
  });
}
