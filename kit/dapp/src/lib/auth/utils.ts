import { auth } from "@/lib/auth/auth";
import { redirectToSignIn } from "@/lib/auth/redirect";
import type { Locale } from "next-intl";
import { getLocale } from "next-intl/server";
import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { headers } from "next/headers";
import type { User } from "./types";

/**
 * Get the currently authenticated user
 * @returns The authenticated user
 * @throws {AuthError} If user is not authenticated
 */
export async function getUser() {
  const nextHeaders = await headers();
  const locale = await getLocale();
  return getSession({
    headers: Object.fromEntries(nextHeaders.entries()),
    locale,
  });
}

async function getSession({
  headers,
  locale,
}: {
  headers: Record<string, string>;
  locale: Locale;
}) {
  "use cache";
  cacheTag("session");
  cacheLife("session");
  try {
    const session = await auth.api.getSession({
      headers: new Headers(headers),
    });
    if (!session?.user) {
      return redirectToSignIn(locale);
    }
    return session.user as User;
  } catch (err) {
    const error = err as Error;
    console.error(`Error getting user: ${error.message}`, error.stack);
    return redirectToSignIn(locale);
  }
}
