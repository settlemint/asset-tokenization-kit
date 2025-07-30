import type { SessionUser } from "@/lib/auth";
import type { GenericEndpointContext } from "better-auth";
import { setSessionCookie } from "better-auth/cookies";

/**
 *
 * @param ctx
 * @param updatedUserFields
 */
export async function updateSession(
  ctx: GenericEndpointContext,
  updatedUserFields: Partial<SessionUser>
) {
  if (!ctx.context.session) {
    return;
  }
  const user = ctx.context.session.user as SessionUser;
  const updatedUser = await ctx.context.internalAdapter.updateUser(
    user.id,
    updatedUserFields,
    ctx
  );
  const newSession = await ctx.context.internalAdapter.createSession(
    user.id,
    ctx,
    false,
    ctx.context.session.session
  );
  await ctx.context.internalAdapter.deleteSession(
    ctx.context.session.session.token
  );
  await setSessionCookie(ctx, {
    session: newSession,
    user: updatedUser,
  });
}

/**
 *
 * @param ctx
 * @param data
 * @param data.password
 * @param data.userId
 */
export async function validatePassword(
  ctx: GenericEndpointContext,
  data: {
    password: string;
    userId: string;
  }
) {
  const accounts = await ctx.context.internalAdapter.findAccounts(data.userId);
  const credentialAccount = accounts.find(
    (account) => account.providerId === "credential"
  );
  const currentPassword = credentialAccount?.password;
  if (!credentialAccount || !currentPassword) {
    return false;
  }
  const compare = await ctx.context.password.verify({
    hash: currentPassword,
    password: data.password,
  });
  return compare;
}

/**
 * Checks if the user is onboarded.
 *
 * @param user - The user to check.
 * @returns True if the user is onboarded, false otherwise.
 */
export function isOnboarded(
  user: Pick<
    SessionUser,
    | "pincodeEnabled"
    | "pincodeVerificationId"
    | "twoFactorEnabled"
    | "twoFactorVerificationId"
    | "secretCodeVerificationId"
    | "secretCodesConfirmed"
    | "wallet"
  >
): boolean {
  const pincodeSet =
    (user.pincodeEnabled && !!user.pincodeVerificationId) ?? false;
  const twoFactorSet =
    (user.twoFactorEnabled && !!user.twoFactorVerificationId) ?? false;
  const secretCodeSet =
    !!user.secretCodeVerificationId && (user.secretCodesConfirmed ?? false);
  const isVerificationSet = (pincodeSet || twoFactorSet) && secretCodeSet;
  return isVerificationSet;
}
