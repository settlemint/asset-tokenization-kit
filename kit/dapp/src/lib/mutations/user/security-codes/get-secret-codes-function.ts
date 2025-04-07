import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { ApiError } from "next/dist/server/api-utils";

/**
 * GraphQL mutation to get secret codes
 */
const GetSecretCodes = portalGraphql(`
  mutation GetSecretCodes($address: String!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: { secretCodes: { name: "SECRET_CODES" } }
    ) {
      id
      name
      parameters
      verificationType
    }
  }
`);

/**
 * Function to get secret codes
 *
 * @param ctx - Optional context containing user information
 * @returns Object indicating success status
 */
export async function getSecretCodesFunction({
  ctx,
}: {
  ctx?: { user: User };
}) {
  const currentUser = ctx?.user ?? (await getUser());
  const { createWalletVerification } = await portalClient.request(
    GetSecretCodes,
    {
      address: currentUser.wallet,
    }
  );
  if (!createWalletVerification?.id) {
    throw new ApiError(500, "Failed to create wallet verification");
  }
  const parameters = createWalletVerification?.parameters as {
    secretCodes?: string;
  };
  return {
    success: true,
    secretCodes: parameters?.secretCodes?.split(",") ?? [],
  };
}
