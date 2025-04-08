import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth/auth";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { headers } from "next/headers";

/**
 * GraphQL query to get the user's pincode and two-factor authentication status
 */
const GetUser = hasuraGraphql(`
  query GetUser($id: String!) {
    user(where:{id: {_eq: $id}}) {
      id
      name
      pincode_enabled
      two_factor_enabled
    }
  }
`);

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
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      // Redirect to sign-in page without showing an error
      redirect({ href: "/auth/sign-in", locale: "en" });
      // This line is never reached due to redirect, but helps TypeScript understand
      return false;
    }

    if (session.user.twoFactorEnabled) {
      // two factor is automatically updating the session data (using the better auth plugin), while pincode is not
      return true;
    }

    // We need to get this info from hasura because the session data is only updated after a logout/login so we cannot rely on this for the pincode
    try {
      const result = await hasuraClient.request(GetUser, {
        id: session.user.id,
      });
      const user = result.user[0];
      if (!user) {
        return false;
      }
      return user.pincode_enabled ?? user.two_factor_enabled ?? false;
    } catch (err) {
      // If we can't fetch the user data, assume they don't have verification
      return false;
    }
  } catch (error) {
    // If there's any error with the session, redirect to sign-in without showing an error
    redirect({ href: "/auth/sign-in", locale: "en" });
    // This line is never reached due to redirect, but helps TypeScript understand
    return false;
  }
};
