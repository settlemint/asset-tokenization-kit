import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import type { IdentityClaim } from "@atk/zod/claim";
import { getUserRole } from "@atk/zod/user-roles";

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
}: {
  userData: UserData;
  kyc: KycData | null;
}): User {
  return {
    id: userData.id,
    name:
      kyc?.firstName && kyc.lastName
        ? `${kyc.firstName} ${kyc.lastName}`
        : userData.name,
    email: userData.email,
    role: getUserRole(userData.role),
    wallet: userData.wallet,
    firstName: kyc?.firstName,
    lastName: kyc?.lastName,
    identity: undefined,
    claims: [],
    isRegistered: false,
    createdAt: userData.createdAt?.toISOString(),
    lastLoginAt: userData.lastLoginAt?.toISOString(),
  } as User;
}

export function buildUserWithIdentity({
  userData,
  kyc,
  identity,
  claims,
  isRegistered,
}: {
  userData: UserData;
  kyc: KycData | null;
  identity: string | undefined;
  claims: IdentityClaim[];
  isRegistered: boolean;
}): User {
  return {
    id: userData.id,
    name:
      kyc?.firstName && kyc.lastName
        ? `${kyc.firstName} ${kyc.lastName}`
        : userData.name,
    email: userData.email,
    role: getUserRole(userData.role),
    wallet: userData.wallet,
    firstName: kyc?.firstName,
    lastName: kyc?.lastName,
    identity,
    claims,
    isRegistered,
    createdAt: userData.createdAt?.toISOString(),
    lastLoginAt: userData.lastLoginAt?.toISOString(),
  } as User;
}
