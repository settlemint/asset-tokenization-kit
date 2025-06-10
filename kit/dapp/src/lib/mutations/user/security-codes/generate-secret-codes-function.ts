import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { revalidateTag } from "next/cache";
import { ApiError } from "next/dist/server/api-utils";

/**
 * GraphQL mutation to get secret codes
 */
// const GenerateSecretCodes = portalGraphql(`
//   mutation GenerateSecretCodes($address: String!) {
//     createWalletVerification(
//       userWalletAddress: $address
//       verificationInfo: { secretCodes: { name: "SECRET_CODES" } }
//     ) {
//       id
//       name
//       parameters
//       verificationType
//     }
//   }
// `);

/**
 * GraphQL mutation to remove secret codes
 */
// const RemoveSecretCodes = portalGraphql(`
//   mutation RemoveSecretCodes($address: String!, $verificationId: String!) {
//     deleteWalletVerification(
//       userWalletAddress: $address
//       verificationId: $verificationId
//     ) {
//       success
//     }
//   }
// `);

/**
 * Function to generate secret codes
 *
 * @param ctx - Optional context containing user information
 * @returns Object indicating success status
 */
export async function generateSecretCodesFunction({
  ctx,
}: {
  ctx?: { user: User };
}) {
  const currentUser = ctx?.user ?? (await getUser());
  if (currentUser.secretCodeVerificationId) {
    await portalClient.request(RemoveSecretCodes, {
      address: currentUser.wallet,
      verificationId: currentUser.secretCodeVerificationId,
    });
  }
  const { createWalletVerification } = await portalClient.request(
    GenerateSecretCodes,
    {
      address: currentUser.wallet,
    }
  );
  if (!createWalletVerification?.id) {
    throw new ApiError(500, "Failed to create wallet verification");
  }
  revalidateTag("user");
  const parameters = createWalletVerification?.parameters as {
    secretCodes?: string;
  };
  const verificationId = createWalletVerification.id as string;
  return {
    secretCodes: parameters?.secretCodes?.split(",") ?? [],
    verificationId,
  };
}
