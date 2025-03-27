import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";
import { cache } from "react";

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
 * GraphQL query to get wallet verifications for a user
 */
const UserWalletVerifications = portalGraphql(`
  query UserWalletVerifications($userWalletAddress: String = "") {
    getWalletVerifications(userWalletAddress: $userWalletAddress) {
      id
      name
      verificationType
    }
  }
`);

/**
 * Fetches wallet verifications for the logged in user
 *
 * @returns Array of wallet verification information
 */
export const getUserWalletVerifications = cache(
  async (ctx?: { user: User }) => {
    const currentUser = ctx?.user ?? (await getUser());
    const result = await portalClient.request(UserWalletVerifications, {
      userWalletAddress: currentUser.wallet,
    });
    return safeParse(
      t.Array(WalletVerificationSchema),
      result.getWalletVerifications || []
    );
  }
);

/**
 * Checks if the logged in user has a wallet verification
 *
 * @returns True if the user has a wallet verification, false otherwise
 */
export const hasWalletVerification = cache(async () => {
  const verifications = await getUserWalletVerifications();
  return verifications.length > 0;
});
