import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

export async function redirectToSignIn(): Promise<never> {
  const locale = await getLocale();

  return redirect({
    href: "/auth/sign-in",
    locale,
  });
}
