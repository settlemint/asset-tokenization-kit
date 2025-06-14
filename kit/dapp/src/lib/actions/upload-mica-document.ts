"use server";

import { withTracing } from "@/lib/sentry/sentry-tracing";
import { client as minioClient } from "@/lib/settlemint/minio";
import { randomUUID } from "crypto";

// Default bucket name
const DEFAULT_BUCKET = "uploads";

export interface UploadMicaDocumentInput {
  file: File;
  assetAddress: string;
  documentType: string;
  title?: string;
  metadata?: Record<string, string>;
}

export async function uploadMicaDocumentAction(input: UploadMicaDocumentInput) {
  return withTracing("queries", "uploadMicaDocumentAction", async () => {
    try {
      const { file, assetAddress, documentType, title, metadata = {} } = input;

      // Validate inputs
      if (!file || !assetAddress || !documentType) {
        return {
          success: false,
          error: "Missing required fields: file, assetAddress, or documentType",
        };
      }

      // Generate unique filename
      const fileExtension = file.name.split(".").pop();
      const uniqueId = randomUUID();
      const fileName = `${title || file.name.split(".")[0]}_${uniqueId}.${fileExtension}`;

      // Determine the upload path based on document type
      let uploadPath: string;
      if (documentType === "mica") {
        uploadPath = `regulations/mica/${assetAddress}/${fileName}`;
      } else {
        uploadPath = `Documents/${documentType}/${fileName}`;
      }

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Prepare metadata
      const documentMetadata = {
        assetAddress,
        documentType,
        title: title || file.name,
        uploadDate: new Date().toISOString(),
        originalFileName: file.name,
        contentType: file.type,
        ...metadata,
      };

      // Upload to MinIO
      await minioClient.putObject(
        DEFAULT_BUCKET,
        uploadPath,
        buffer,
        buffer.length,
        {
          "Content-Type": file.type,
          ...documentMetadata,
        }
      );

      // Generate presigned URL for immediate access
      const url = await minioClient.presignedGetObject(
        DEFAULT_BUCKET,
        uploadPath,
        3600 // 1 hour
      );

      console.log(`Successfully uploaded document: ${uploadPath}`);

      return {
        success: true,
        data: {
          id: uniqueId,
          fileName,
          uploadPath,
          url,
          size: buffer.length,
          documentType,
          assetAddress,
          title: title || file.name,
        },
      };
    } catch (error) {
      console.error("Error uploading MiCA document:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  });
}
