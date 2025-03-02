import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

type UserRole = "admin" | "issuer" | "user";

/**
 * Get the currently authenticated user
 * @returns The authenticated user
 * @throws {AuthError} If user is not authenticated
 */
export async function getUser(locale: string, requiredRoles?: UserRole[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect({
      href: `/auth/signin`,
      locale,
    });
  }

  if (requiredRoles && !requiredRoles.includes(session.user.role as UserRole)) {
    redirect({
      href: `/auth/wrong-role`,
      locale,
    });
  }

  return session.user;
}
