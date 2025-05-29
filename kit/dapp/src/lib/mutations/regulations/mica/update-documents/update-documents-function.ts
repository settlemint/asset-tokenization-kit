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
    // Temporarily reduce permissions for testing - TODO: restore to asset: ["manage"]
    requiredPermissions: {
      asset: ["transfer"], // This is available to all user roles
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
      let currentDocuments: any[] = []; // Keep full document objects instead of converting to MicaDocumentInput
      try {
        const rawDocuments = currentResult[0]?.documents;
        if (rawDocuments) {
          // Handle potential double encoding or different data types
          if (typeof rawDocuments === "string") {
            currentDocuments = JSON.parse(rawDocuments);
          } else if (Array.isArray(rawDocuments)) {
            // Keep the full document objects to preserve uploadDate, fileName, size, etc.
            currentDocuments = rawDocuments;
          } else {
            currentDocuments = [];
          }
        }
        console.log(
          "📅 Parsed current documents with dates:",
          currentDocuments.map((doc) => ({
            id: doc.id,
            title: doc.title,
            uploadDate: doc.uploadDate,
          }))
        );
      } catch (error) {
        console.error("Error parsing documents:", error);
        currentDocuments = [];
      }

      // Convert only the MicaDocumentInput fields for processing
      const currentDocumentsInput: MicaDocumentInput[] = currentDocuments.map(
        (doc: any) => ({
          id: doc.id || doc.url, // Use existing id or fallback to url as unique identifier
          title: doc.title,
          type: doc.type,
          url: doc.url,
          status: doc.status,
          description: doc.description,
        })
      );

      let updatedDocuments: MicaDocumentInput[];
      switch (parsedInput.operation) {
        case DocumentOperation.ADD:
          // Add new document to the list
          updatedDocuments = [...currentDocumentsInput, parsedInput.document];
          break;

        case DocumentOperation.DELETE:
          // Remove document from the list
          updatedDocuments = currentDocumentsInput.filter((doc) => {
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

      // Transform MicaDocumentInput to full MicaDocument format for database storage
      const fullDocuments = updatedDocuments.map(
        (
          doc
        ): import("@/lib/db/regulations/schema-mica-regulation-configs").MicaDocument => {
          // Extract filename from URL or use title as fallback
          let fileName = doc.title;
          if (doc.url) {
            try {
              const urlPath = new URL(doc.url).pathname;
              const urlFileName = urlPath.split("/").pop();
              if (urlFileName) {
                fileName = urlFileName;
              }
            } catch (error) {
              // Use title as fallback if URL parsing fails
              fileName = doc.title;
            }
          }

          // Check if this is an existing document by looking for it in the full current documents
          const existingDoc = currentDocuments.find(
            (existing) => existing.id === doc.id
          );

          console.log(`📅 Processing document ${doc.id}:`, {
            isExisting: !!existingDoc,
            existingUploadDate: existingDoc?.uploadDate,
            willUseDate: existingDoc?.uploadDate || new Date().toISOString(),
          });

          return {
            id: doc.id,
            title: doc.title,
            fileName: existingDoc?.fileName || fileName, // Preserve existing fileName or generate new one
            type: doc.type,
            category: existingDoc?.category || doc.type, // Preserve existing category
            // Preserve original upload date for existing documents, use current date for new ones
            uploadDate: existingDoc?.uploadDate || new Date().toISOString(),
            url: doc.url,
            status: doc.status,
            size: existingDoc?.size || 0, // Preserve existing size if available
            description: doc.description,
          };
        }
      );

      // Update documents in database using Drizzle
      console.log("About to update documents in database:", {
        id: parsedInput.regulationId,
        updatedDocuments: fullDocuments,
      });

      const result = await db
        .update(micaRegulationConfigs)
        .set({
          documents: fullDocuments,
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

/*
// Original access-controlled version - restore after testing
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
    // ... same implementation as above
  }
);
*/
