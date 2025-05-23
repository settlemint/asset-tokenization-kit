"use server";

import { deleteFile } from "@/lib/actions/delete-file";
import type { User } from "@/lib/auth/types";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import {
  DocumentOperation,
  type MicaDocumentInput,
  type UpdateDocumentsInput,
} from "./update-documents-schema";

// GraphQL query to get current documents
const GetMicaDocuments = hasuraGraphql(`
  query GetMicaDocuments($id: String!) {
    mica_regulation_configs_by_pk(id: $id) {
      documents
    }
  }
`);

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
      // Get current documents
      const currentResult = await hasuraClient.request(GetMicaDocuments, {
        id: parsedInput.regulationId,
      });

      // Parse the documents from JSON string, handling potential double encoding
      let currentDocuments: MicaDocumentInput[] = [];
      try {
        const rawDocuments =
          currentResult.mica_regulation_configs_by_pk?.documents;
        if (rawDocuments) {
          // Handle potential double encoding
          const parsedDocs =
            typeof rawDocuments === "string"
              ? JSON.parse(rawDocuments)
              : rawDocuments;
          currentDocuments = Array.isArray(parsedDocs) ? parsedDocs : [];
        }
      } catch (error) {
        console.error("Error parsing documents:", error);
        currentDocuments = [];
      }

      let updatedDocuments: MicaDocumentInput[];
      switch (parsedInput.operation) {
        case DocumentOperation.ADD:
          // Add new document to the list
          updatedDocuments = [...currentDocuments, parsedInput.document];
          break;

        case DocumentOperation.DELETE:
          // Remove document from the list
          updatedDocuments = currentDocuments.filter((doc) => {
            const matches = doc.id !== parsedInput.document.id;
            return matches;
          });

          // Delete the file from storage if it exists
          if (parsedInput.document.url) {
            try {
              await deleteFile(parsedInput.document.url);
            } catch (error) {
              console.error("Error deleting file:", error);
              // Continue with document deletion even if file deletion fails
            }
          }
          break;

        default:
          throw new Error(`Invalid operation: ${parsedInput.operation}`);
      }

      // Update documents in database
      const result = await hasuraClient.request(UpdateMicaDocuments, {
        id: parsedInput.regulationId,
        documents: JSON.stringify(updatedDocuments),
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
