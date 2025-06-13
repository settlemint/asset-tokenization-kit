"use server";

import { client as minioClient } from "@/lib/settlemint/minio";
import { withTracing } from "@/lib/utils/sentry-tracing";

// Default bucket name
const DEFAULT_BUCKET = "uploads";

export async function deleteMicaDocumentAction(documentPath: string) {
  return withTracing("queries", "deleteMicaDocumentAction", async () => {
    try {
      // Validate input
      if (!documentPath || typeof documentPath !== "string") {
        return {
          success: false,
          error: "Invalid document path",
        };
      }

      // Check if document exists before deletion
      try {
        await minioClient.statObject(DEFAULT_BUCKET, documentPath);
      } catch (error) {
        return {
          success: false,
          error: "Document not found",
        };
      }

      // Delete the document from MinIO
      await minioClient.removeObject(DEFAULT_BUCKET, documentPath);

      console.log(`Successfully deleted document: ${documentPath}`);

      return {
        success: true,
        message: "Document deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting MiCA document:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  });
}
