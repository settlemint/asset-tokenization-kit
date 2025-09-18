import type { Context } from "@/orpc/context/context";
import { mapUserRoles } from "@/orpc/helpers/role-validation";
import type { IdentityClaim } from "@atk/zod/claim";
import { getUserRole } from "@atk/zod/user-roles";
import { UserWithIdentity } from "../routes/user.list.schema";

export interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  wallet: `0x${string}` | null;
  createdAt: Date | null;
  lastLoginAt: Date | null;
}

export interface KycData {
  firstName: string | null;
  lastName: string | null;
}

export function buildUserWithoutWallet({
  userData,
  kyc,
  context,
}: {
  userData: UserData;
  kyc: KycData | null;
  context: Required<Pick<Context, "system">>;
}) {
  const roles = mapUserRoles(
    userData.wallet,
    context.system?.systemAccessManager?.accessControl
  );
  return {
    id: userData.id,
    name:
      kyc?.firstName && kyc.lastName
        ? `${kyc.firstName} ${kyc.lastName}`
        : userData.name,
    email: userData.email,
    role: getUserRole(userData.role),
    roles,
    wallet: userData.wallet,
    firstName: kyc?.firstName,
    lastName: kyc?.lastName,
    identity: undefined,
    claims: [],
    isRegistered: false,
    createdAt: userData.createdAt?.toISOString(),
    lastLoginAt: userData.lastLoginAt?.toISOString(),
  } as UserWithIdentity;
}

export function buildUserWithIdentity({
  userData,
  kyc,
  identity,
  claims,
  isRegistered,
  context,
}: {
  userData: UserData;
  kyc: KycData | null;
  identity: string | undefined;
  claims: IdentityClaim[];
  isRegistered: boolean;
  context: Required<Pick<Context, "system">>;
}) {
  const roles = mapUserRoles(
    userData.wallet,
    context.system?.systemAccessManager?.accessControl
  );
  return {
    id: userData.id,
    name:
      kyc?.firstName && kyc.lastName
        ? `${kyc.firstName} ${kyc.lastName}`
        : userData.name,
    email: userData.email,
    role: getUserRole(userData.role),
    roles,
    wallet: userData.wallet,
    firstName: kyc?.firstName,
    lastName: kyc?.lastName,
    identity,
    claims,
    isRegistered,
    createdAt: userData.createdAt?.toISOString(),
    lastLoginAt: userData.lastLoginAt?.toISOString(),
  } as UserWithIdentity;
}
