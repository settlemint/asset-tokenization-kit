import { auth } from "@/lib/auth/auth";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

/**
 * TypeBox schema for wallet verification data
 */
export const WalletVerificationSchema = t.Object(
  {
    id: t.String({
      description: "The unique identifier of the verification",
    }),
    name: t.String({
      description: "The name of the verification method",
    }),
    verificationType: t.String({
      description: "The type of verification performed",
    }),
  },
  {
    description: "Information about a wallet verification method",
  }
);
export type WalletVerification = StaticDecode<typeof WalletVerificationSchema>;

/**
 * Checks if the logged in user has a wallet verification
 *
 * @returns True if the user has a wallet verification, false otherwise
 */
export const hasWalletVerification = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  return session.user.twoFactorEnabled ?? session.user.pincodeEnabled ?? false;
};
