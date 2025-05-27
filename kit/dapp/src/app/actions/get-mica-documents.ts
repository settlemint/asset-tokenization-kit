"use server";

import { client as minioClient } from "@/lib/settlemint/minio";
import { withTracing } from "@/lib/utils/tracing";

// Default bucket name
const DEFAULT_BUCKET = "uploads";

export interface MicaDocument {
  id: string;
  title: string;
  fileName: string;
  type: string;
  category: string;
  uploadDate: string;
  status: "approved" | "pending" | "rejected";
  url: string;
  size: number;
}

export const getMicaDocumentsAction = withTracing(
  "queries",
  "getMicaDocumentsAction",
  async (assetAddress: string) => {
    try {
      // Validate asset address
      if (!assetAddress || typeof assetAddress !== "string") {
        return {
          success: false,
          error: "Invalid asset address",
          data: [],
        };
      }

      console.log(`Fetching MiCA documents for asset: ${assetAddress}`);

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
        `Documents/Governance`,
        `Documents/Policy`,
        `Documents/Procedure`,
        // Also search broadly in Documents folder
        `Documents/`,
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

        let prefixCount = 0;

        for await (const obj of objectsStream) {
          // For documents not in the assetAddress-specific folder,
          // check metadata or filename for the asset address to filter
          if (!prefix.includes(assetAddress)) {
            let shouldInclude = false;

            // Check if object metadata contains the asset address
            try {
              const stat = await minioClient.statObject(
                DEFAULT_BUCKET,
                obj.name
              );
              const meta = stat.metaData || {};

              // If this document references our asset, include it
              if (meta.assetAddress === assetAddress) {
                shouldInclude = true;
              }
              // If no assetAddress in metadata but we're in a specific document type folder, include it
              else if (!meta.assetAddress && prefix !== "Documents/") {
                shouldInclude = true;
              }
              // If we're doing broad Documents search, only include if assetAddress matches
              else if (
                prefix === "Documents/" &&
                meta.assetAddress !== assetAddress
              ) {
                shouldInclude = false;
              }
            } catch (_) {
              // If we can't check metadata and it's not a broad search, include the document
              if (prefix !== "Documents/") {
                shouldInclude = true;
              }
            }

            if (!shouldInclude) {
              continue;
            }
          }

          allDocuments.push(obj);
          prefixCount++;
        }

        console.log(`Found ${prefixCount} documents in prefix: ${prefix}`);
      }

      console.log(
        `Found ${allDocuments.length} MiCA documents for asset ${assetAddress}`
      );

      const documents: MicaDocument[] = await Promise.all(
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
            if ((error as any)?.code !== "AccessDenied") {
              console.warn(`Could not fetch metadata for ${obj.name}:`, error);
            } else {
              console.debug(
                `Auth issue with metadata for ${obj.name} - continuing without metadata`
              );
            }
          }

          // Determine document type and category based on path or metadata
          const category = pathParts.length > 1 ? pathParts[1] : "general";

          // Extract document type - prioritize folder structure
          let type = "Other";

          // First try to determine type from the path
          if (pathParts.length > 1) {
            // If path is Documents/Audit/... then type is Audit
            if (pathParts[0] === "Documents" && pathParts.length > 1) {
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

          // Then check if type is explicitly set in metadata
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
          const statusOptions = ["approved", "pending"] as const;
          const randomStatus =
            statusOptions[Math.floor(Math.random() * statusOptions.length)];

          return {
            id: obj.name?.replace(/[^a-zA-Z0-9]/g, "") || "unknown",
            title: fileName,
            fileName,
            type,
            category,
            uploadDate:
              obj.lastModified?.toISOString() || new Date().toISOString(),
            status: randomStatus,
            url,
            size: obj.size || 0,
          } as MicaDocument;
        })
      );

      // Sort documents by upload date (newest first)
      documents.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );

      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      console.error("Error fetching MiCA documents:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        data: [],
      };
    }
  }
);
