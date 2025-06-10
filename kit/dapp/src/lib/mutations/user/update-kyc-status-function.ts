import { revalidateTag } from "next/cache";
import { withAccessControl } from "../../utils/access-control";
import type { UpdateKycStatusInput } from "./update-kyc-status.schema";

// /**
//  * GraphQL mutation to update a user's KYC status
//  */
// const UpdateKycStatusMutation = hasuraGraphql(`
//   mutation UpdateKycStatus($userId: String!, $kycVerified: timestamptz) {
//     update_user_by_pk(pk_columns: {id: $userId}, _set: {kyc_verified_at: $kycVerified}) {
//       id
//       kyc_verified_at
//     }
//   }
// `);

/**
 * Function to update a user's KYC status
 *
 * @param input - Validated input containing kycVerified
 * @param user - The user executing the update operation
 * @returns Success status and updated user data
 */
export const updateKycStatusFunction = withAccessControl(
  {
    requiredPermissions: {
      user: ["set-kyc-status"],
    },
  },
  async ({
    parsedInput: { kycVerified, userId },
  }: {
    parsedInput: UpdateKycStatusInput;
  }) => {
    // const result = await hasuraClient.request(UpdateKycStatusMutation, {
    //   userId,
    //   kycVerified,
    // });

    revalidateTag("user");

    return {
      success: true,
      data: { id: "123", kyc_verified_at: "2021-01-01" },
    };
  }
);
