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
 * Fetches wallet verifications for a user's wallet address
 *
 * @param userWalletAddress - The wallet address to check verifications for
 * @returns Array of wallet verification information
 */
export const getUserWalletVerifications = cache(
  async (userWalletAddress: string) => {
    const result = await portalClient.request(UserWalletVerifications, {
      userWalletAddress,
    });
    return safeParse(
      t.Array(WalletVerificationSchema),
      result.getWalletVerifications || []
    );
  }
);
