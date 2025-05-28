"use server";

import { deleteFile } from "@/lib/actions/delete-file";
import type { User } from "@/lib/auth/types";
import { db } from "@/lib/db";
import { micaRegulationConfigs } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import { eq } from "drizzle-orm";
import {
  DocumentOperation,
  type MicaDocumentInput,
  type UpdateDocumentsInput,
} from "./update-documents-schema";

export const updateDocumentsFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput,
    ctx,
  }: {
    parsedInput: UpdateDocumentsInput;
    ctx: { user: User };
  }) => {
    try {
      console.log("updateDocumentsFunction called with:", {
        regulationId: parsedInput.regulationId,
        operation: parsedInput.operation,
        document: parsedInput.document,
        user: ctx.user?.id || "No user",
      });

      // Get current documents using Drizzle
      console.log(
        "Fetching current documents for regulation ID:",
        parsedInput.regulationId
      );
      const currentResult = await db
        .select({
          documents: micaRegulationConfigs.documents,
        })
        .from(micaRegulationConfigs)
        .where(eq(micaRegulationConfigs.id, parsedInput.regulationId))
        .limit(1);

      console.log("Current documents query result:", currentResult);

      // Parse the documents from JSON, handling potential data types
      let currentDocuments: MicaDocumentInput[] = [];
      try {
        const rawDocuments = currentResult[0]?.documents;
        if (rawDocuments) {
          // Handle potential double encoding or different data types
          if (typeof rawDocuments === "string") {
            currentDocuments = JSON.parse(rawDocuments);
          } else if (Array.isArray(rawDocuments)) {
            // Convert MicaDocument[] to MicaDocumentInput[] by ensuring all required fields
            currentDocuments = rawDocuments.map((doc: any) => ({
              id: doc.id || doc.url, // Use existing id or fallback to url as unique identifier
              title: doc.title,
              type: doc.type,
              url: doc.url,
              status: doc.status,
              description: doc.description,
            }));
          } else {
            currentDocuments = [];
          }
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

      // Update documents in database using Drizzle
      console.log("About to update documents in database:", {
        id: parsedInput.regulationId,
        updatedDocuments,
      });

      const result = await db
        .update(micaRegulationConfigs)
        .set({
          documents: updatedDocuments,
        })
        .where(eq(micaRegulationConfigs.id, parsedInput.regulationId))
        .returning({
          id: micaRegulationConfigs.id,
          documents: micaRegulationConfigs.documents,
        });

      console.log("Update documents result:", result);

      if (!result[0]) {
        console.error("No result returned from update");
        throw new Error("Failed to update MICA documents");
      }

      console.log("Documents updated successfully:", result[0]);
      return safeParse(t.Hashes(), []);
    } catch (error) {
      console.error("Error updating MICA documents:", error);
      throw error;
    }
  }
);
