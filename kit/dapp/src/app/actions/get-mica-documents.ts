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

      console.log(`🔍 Fetching MiCA documents for asset: ${assetAddress}`);

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
      // Use a Set to avoid duplicates based on object name
      const seenObjectNames = new Set<string>();
      let totalDocumentsFound = 0;
      let totalDocumentsIncluded = 0;

      // Search in each prefix
      for (const prefix of prefixes) {
        console.log(`🔍 Searching for documents with prefix: ${prefix}`);
        const objectsStream = minioClient.listObjects(
          DEFAULT_BUCKET,
          prefix,
          true
        );

        let prefixCount = 0;
        let prefixIncluded = 0;

        for await (const obj of objectsStream) {
          totalDocumentsFound++;
          console.log(
            `📄 Found object: ${obj.name} (size: ${obj.size}, lastModified: ${obj.lastModified})`
          );

          // Skip if we've already seen this object
          if (seenObjectNames.has(obj.name)) {
            console.log(`⏭️ Skipping duplicate object: ${obj.name}`);
            continue;
          }

          let shouldInclude = true; // Default to including documents
          let exclusionReason = "";

          // For documents not in the assetAddress-specific folder,
          // apply more lenient filtering
          if (!prefix.includes(assetAddress)) {
            // If this is the broad Documents/ search, be more selective
            if (prefix === "Documents/") {
              // Check metadata only for the broad search
              try {
                const stat = await minioClient.statObject(
                  DEFAULT_BUCKET,
                  obj.name
                );
                const meta = stat.metaData || {};
                console.log(`📋 Metadata for ${obj.name}:`, meta);

                // If metadata has assetAddress and it doesn't match, exclude
                if (meta.assetAddress && meta.assetAddress !== assetAddress) {
                  shouldInclude = false;
                  exclusionReason = `assetAddress mismatch: ${meta.assetAddress} !== ${assetAddress}`;
                }
                // If no assetAddress in metadata, include it (could be our document)
              } catch (error) {
                // If metadata access fails, include the document
                console.log(
                  `⚠️ Could not check metadata for ${obj.name}, including by default. Error:`,
                  error
                );
              }
            }
            // For specific document type folders (like Documents/mica, Documents/Audit, etc.)
            // include all documents as they are likely relevant
          }

          if (shouldInclude) {
            allDocuments.push(obj);
            seenObjectNames.add(obj.name);
            prefixCount++;
            prefixIncluded++;
            totalDocumentsIncluded++;
            console.log(
              `✅ Added document: ${obj.name} (from prefix: ${prefix})`
            );
          } else {
            console.log(`❌ Excluding ${obj.name} - ${exclusionReason}`);
          }
        }

        console.log(
          `📊 Found ${prefixCount} documents in prefix: ${prefix} (${prefixIncluded} included)`
        );
      }

      console.log(
        `📊 SUMMARY: Found ${totalDocumentsFound} total objects, included ${totalDocumentsIncluded} documents`
      );
      console.log(
        `📋 Document names:`,
        allDocuments.map((doc) => doc.name)
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

      console.log(
        `📊 Returning ${documents.length} documents after processing and sorting`
      );
      console.log(
        `📋 Final document list:`,
        documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          uploadDate: doc.uploadDate,
        }))
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
