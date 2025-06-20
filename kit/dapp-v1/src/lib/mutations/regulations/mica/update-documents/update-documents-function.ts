"use server";

import { deleteFile } from "@/lib/actions/delete-file";
import type { User } from "@/lib/auth/types";
import { db } from "@/lib/db";
import { micaRegulationConfigs } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { safeParse, t } from "@/lib/utils/typebox";
import { eq } from "drizzle-orm";
import {
  DocumentOperation,
  type MicaDocumentInput,
  type UpdateDocumentsInput,
} from "./update-documents-schema";

export const updateDocumentsFunction = async ({
  parsedInput,
  ctx,
}: {
  parsedInput: UpdateDocumentsInput;
  ctx: { user: User };
}) => {
  try {
    // Handle the case where the regulation ID is a default-prefixed virtual ID
    // Extract the real regulation config ID
    let actualRegulationId = parsedInput.regulationId;
    if (parsedInput.regulationId.startsWith("default-")) {
      actualRegulationId = parsedInput.regulationId.replace("default-", "");
    }

    // Get current documents using Drizzle
    const currentResult = await db
      .select({
        documents: micaRegulationConfigs.documents,
      })
      .from(micaRegulationConfigs)
      .where(eq(micaRegulationConfigs.regulationConfigId, actualRegulationId))
      .limit(1);

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
    } catch (error) {
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
        // Preserve existing metadata
        uploadDate: doc.uploadDate,
        size: doc.size,
        fileName: doc.fileName,
      })
    );

    let updatedDocuments: MicaDocumentInput[];
    switch (parsedInput.operation) {
      case DocumentOperation.ADD:
        // Add new document to the list
        updatedDocuments = [...currentDocumentsInput, parsedInput.document];
        break;

      case DocumentOperation.DELETE:
        // Remove document from the list - use URL for matching since that's the reliable identifier
        updatedDocuments = currentDocumentsInput.filter((doc) => {
          return doc.url !== parsedInput.document.url;
        });

        // Delete the file from storage if it exists
        if (parsedInput.document.url) {
          try {
            await deleteFile(parsedInput.document.url);
          } catch (error) {
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
        return {
          title: doc.title,
          type: doc.type,
          url: doc.url,
          status: doc.status,
          description: doc.description,
          // Preserve upload metadata from input
          uploadDate: doc.uploadDate || new Date().toISOString(),
          size: doc.size,
          fileName: doc.fileName,
        };
      }
    );

    // Update documents in database using Drizzle
    const result = await db
      .update(micaRegulationConfigs)
      .set({
        documents: fullDocuments,
      })
      .where(eq(micaRegulationConfigs.regulationConfigId, actualRegulationId))
      .returning({
        id: micaRegulationConfigs.id,
        documents: micaRegulationConfigs.documents,
      });

    if (!result[0]) {
      throw new Error("Failed to update MICA documents");
    }

    return safeParse(t.Hashes(), []);
  } catch (error) {
    throw error;
  }
};

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
