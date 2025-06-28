import type { SessionUser } from "@/lib/auth";
import type { GenericEndpointContext } from "better-auth";
import { setSessionCookie } from "better-auth/cookies";

/**
 *
 * @param ctx
 * @param updatedUserFields
 */
export async function revokeSession(
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
