"use server";

import type { User } from "@/lib/auth/types";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { UpdateAuthorizationInput } from "./update-authorization-schema";

// GraphQL mutation for updating MICA authorization
const UpdateMicaAuthorization = hasuraGraphql(`
  mutation UpdateMicaAuthorization(
    $id: String!
    $licenceNumber: String
    $regulatoryAuthority: String
    $approvalDate: timestamptz
    $approvalDetails: String
  ) {
    update_mica_regulation_configs_by_pk(
      pk_columns: { id: $id }
      _set: {
        licence_number: $licenceNumber
        regulatory_authority: $regulatoryAuthority
        approval_date: $approvalDate
        approval_details: $approvalDetails
      }
    ) {
      id
      licence_number
      regulatory_authority
      approval_date
      approval_details
    }
  }
`);

export const updateAuthorizationFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput,
  }: {
    parsedInput: UpdateAuthorizationInput;
    ctx: { user: User };
  }) => {
    try {
      const { regulationId, ...data } = parsedInput;

      // Update the MICA regulation config in the database using Hasura
      const result = await hasuraClient.request(UpdateMicaAuthorization, {
        id: regulationId,
        licenceNumber: data.licenceNumber || null,
        regulatoryAuthority: data.regulatoryAuthority || null,
        approvalDate: data.approvalDate
          ? new Date(data.approvalDate).toISOString()
          : null,
        approvalDetails: data.approvalDetails || null,
      });

      console.log(result);

      if (!result.update_mica_regulation_configs_by_pk) {
        throw new Error("Failed to update MICA authorization");
      }

      return safeParse(t.Hashes(), []);
    } catch (error) {
      console.error("Error updating MICA authorization:", error);
      throw error;
    }
  }
);
