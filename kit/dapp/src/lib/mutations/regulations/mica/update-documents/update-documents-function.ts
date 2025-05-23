"use server";

import type { User } from "@/lib/auth/types";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { UpdateDocumentsInput } from "./update-documents-schema";

// GraphQL mutation for updating MICA documents
const UpdateMicaDocuments = hasuraGraphql(`
  mutation UpdateMicaDocuments(
    $id: String!
    $documents: jsonb!
  ) {
    update_mica_regulation_configs_by_pk(
      pk_columns: { id: $id }
      _set: {
        documents: $documents
      }
    ) {
      id
      documents
    }
  }
`);

export const updateDocumentsFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput,
  }: {
    parsedInput: UpdateDocumentsInput;
    ctx: { user: User };
  }) => {
    try {
      const result = await hasuraClient.request(UpdateMicaDocuments, {
        id: parsedInput.regulationId,
        documents: JSON.stringify(parsedInput.documents),
      });

      if (!result.update_mica_regulation_configs_by_pk) {
        throw new Error("Failed to update MICA documents");
      }

      return safeParse(t.Hashes(), []);
    } catch (error) {
      console.error("Error updating MICA documents:", error);
      throw error;
    }
  }
);
