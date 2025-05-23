import "server-only";

import { client as minioClient } from "@/lib/settlemint/minio";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";
import type { Address } from "viem";

// Default bucket name
const DEFAULT_BUCKET = "uploads";

// Schema for MiCA document metadata
export const MicaDocumentSchema = t.Object(
  {
    id: t.String(),
    title: t.String(),
    fileName: t.String(),
    type: t.String(),
    category: t.String(),
    uploadDate: t.String({ format: "date-time" }),
    status: t.Union([
      t.Literal("approved"),
      t.Literal("pending"),
      t.Literal("rejected"),
    ]),
    url: t.String({ format: "uri" }),
    size: t.Number(),
  },
  { $id: "MicaDocument" }
);

export type MicaDocument = StaticDecode<typeof MicaDocumentSchema>;

/**
 * Fetches MiCA regulation documents for a specific asset
 *
 * @param assetAddress - The blockchain address of the asset
 * @returns Array of MiCA document metadata
 */
export const getMicaDocuments = withTracing(
  "queries",
  "getMicaDocuments",
  async (assetAddress: Address): Promise<MicaDocument[]> => {
    console.log(`Fetching MiCA documents for asset: ${assetAddress}`);

    try {
      // Define multiple prefixes to search for documents
      const prefixes = [
        // Original expected path
        `regulations/mica/${assetAddress}`,
        // Path for documents created through upload-document.ts
        `Documents/mica`,
        // Check generic document types that might contain MICA docs
        `Documents/Compliance`,
        `Documents/Legal`,
        `Documents/Audit`,
        `Documents/Whitepaper`,
      ];

      // Collect documents from all potential locations
      const allDocuments: any[] = [];

      // Search in each prefix
      for (const prefix of prefixes) {
        console.log(`Searching for documents with prefix: ${prefix}`);
        const objectsStream = minioClient.listObjects(
          DEFAULT_BUCKET,
          prefix,
          true
        );

        for await (const obj of objectsStream) {
          // For documents not in the assetAddress-specific folder,
          // check metadata or filename for the asset address to filter
          if (!prefix.includes(assetAddress)) {
            // Check if object metadata contains the asset address
            try {
              const stat = await minioClient.statObject(
                DEFAULT_BUCKET,
                obj.name
              );
              const meta = stat.metaData || {};
              // If this document doesn't reference our asset, skip it
              if (meta.assetAddress && meta.assetAddress !== assetAddress) {
                continue;
              }
            } catch (_) {
              // If we can't check metadata, just include the document
            }
          }

          allDocuments.push(obj);
        }
      }

      console.log(
        `Found ${allDocuments.length} MiCA documents for asset ${assetAddress}`
      );

      const documents = await Promise.all(
        allDocuments.map(async (obj) => {
          // Generate a presigned URL for the document that's valid for 1 hour
          const url = await minioClient.presignedGetObject(
            DEFAULT_BUCKET,
            obj.name,
            3600 // URL valid for 1 hour
          );

          // Extract metadata from the object name and path
          const pathParts = obj.name.split("/");
          const fileName = pathParts[pathParts.length - 1];

          // Try to get more metadata if available
          let metaData = {};
          try {
            const stat = await minioClient.statObject(DEFAULT_BUCKET, obj.name);
            metaData = stat.metaData || {};
          } catch (error) {
            // Don't let metadata failure prevent document listing
            // Only log non-authentication errors at warning level
            if ((error as any)?.code !== "AccessDenied") {
              console.warn(`Could not fetch metadata for ${obj.name}:`, error);
            } else {
              // For auth errors, just log at debug level (won't appear in normal logs)
              console.debug(
                `Auth issue with metadata for ${obj.name} - continuing without metadata`
              );
            }
            // Continue with empty metadata - we'll derive what we can from the filename
          }

          // Determine document type and category based on path or metadata
          const category = pathParts.length > 1 ? pathParts[1] : "general";

          // Extract document type - prioritize folder structure since metadata access might fail
          let type = "Other";

          // First try to determine type from the path
          if (pathParts.length > 1) {
            // If path is Documents/Audit/... then type is Audit
            if (pathParts[0] === "Documents" && pathParts.length > 1) {
              // Capitalize the first letter for nicer display
              type =
                pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1);
            }
            // For MiCA specific paths
            else if (
              pathParts[0] === "regulations" &&
              pathParts[1] === "mica"
            ) {
              type = "MiCA";
            }
          }

          // Then check if type is explicitly set in metadata (might not be available due to auth issues)
          if ((metaData as any)["type"]) {
            type = (metaData as any)["type"];
          }
          // Fallback to extension only if no better type can be derived
          else if (fileName.endsWith(".pdf")) {
            type = "PDF";
          } else if (fileName.endsWith(".docx")) {
            type = "Document";
          }

          // Determine status - in a real application, this might come from a database
          // Here we're just assigning statuses for demonstration purposes
          const statusOptions = ["approved", "pending"] as const;
          const randomStatus =
            statusOptions[Math.floor(Math.random() * statusOptions.length)];

          // For title, use metadata or generate from filename
          const title =
            (metaData as any)["title"] ||
            fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

          return {
            id: obj.name,
            title: title,
            fileName: fileName,
            type: type,
            category: category,
            uploadDate: obj.lastModified.toISOString(),
            status: (metaData as any)["status"] || randomStatus,
            url,
            size: obj.size,
          };
        })
      );

      return safeParse(t.Array(MicaDocumentSchema), documents);
    } catch (error) {
      console.error(
        `Failed to fetch MiCA documents for asset ${assetAddress}:`,
        error
      );
      return [];
    }
  }
);

/**
 * Get a specific MiCA document by ID
 */
export const getMicaDocumentById = withTracing(
  "queries",
  "getMicaDocumentById",
  async (documentId: string): Promise<MicaDocument | null> => {
    console.log(`Getting MiCA document details for: ${documentId}`);

    try {
      // Attempt to get object stats (may fail due to auth issues)
      let statResult;
      let metaData = {};

      try {
        statResult = await minioClient.statObject(DEFAULT_BUCKET, documentId);
        metaData = statResult.metaData || {};
      } catch (error) {
        // Only log non-authentication errors at warning level
        if ((error as any)?.code !== "AccessDenied") {
          console.warn(`Could not fetch metadata for ${documentId}:`, error);
        } else {
          // For auth errors, just log at debug level (won't appear in normal logs)
          console.debug(
            `Auth issue with metadata for ${documentId} - continuing without metadata`
          );
        }
        // Continue even without metadata
      }

      // Generate presigned URL (should still work even if metadata failed)
      const url = await minioClient.presignedGetObject(
        DEFAULT_BUCKET,
        documentId,
        3600
      );

      const pathParts = documentId.split("/");
      const fileName = pathParts[pathParts.length - 1];
      const category = pathParts.length > 1 ? pathParts[1] : "general";

      // Extract document type - prioritize folder structure since metadata access might fail
      let type = "Other";

      // First try to determine type from the path
      if (pathParts.length > 1) {
        // If path is Documents/Audit/... then type is Audit
        if (pathParts[0] === "Documents" && pathParts.length > 1) {
          // Capitalize the first letter for nicer display
          type = pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1);
        }
        // For MiCA specific paths
        else if (pathParts[0] === "regulations" && pathParts[1] === "mica") {
          type = "MiCA";
        }
      }

      // Then check if type is explicitly set in metadata (if available)
      if (metaData && (metaData as any)["type"]) {
        type = (metaData as any)["type"];
      }
      // Fallback to extension
      else if (fileName.endsWith(".pdf")) {
        type = "PDF";
      } else if (fileName.endsWith(".docx")) {
        type = "Document";
      }

      const title =
        (metaData && (metaData as any)["title"]) ||
        fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

      // For the document object creation, provide fallbacks for when statResult is undefined
      const document = {
        id: documentId,
        title: title,
        fileName: fileName,
        type: type,
        category: category,
        // Use current date if statResult is undefined
        uploadDate: statResult
          ? statResult.lastModified.toISOString()
          : new Date().toISOString(),
        status: (metaData as any)["status"] || "pending",
        url,
        // Default size to 0 if statResult is undefined
        size: statResult ? statResult.size : 0,
      };

      return safeParse(MicaDocumentSchema, document);
    } catch (error) {
      console.error(`Failed to get MiCA document ${documentId}:`, error);
      return null;
    }
  }
);
