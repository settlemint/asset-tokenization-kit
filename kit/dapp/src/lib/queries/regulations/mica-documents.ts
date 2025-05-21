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
      // Define the prefix to look for asset-specific documents
      // The structure would typically be regulations/mica/[assetAddress]/...
      const prefix = `regulations/mica/${assetAddress}`;

      // List all objects with the specified prefix
      const objectsStream = minioClient.listObjects(
        DEFAULT_BUCKET,
        prefix,
        true
      );

      const objectsData: any[] = [];
      for await (const obj of objectsStream) {
        objectsData.push(obj);
      }

      console.log(
        `Found ${objectsData.length} MiCA documents for asset ${assetAddress}`
      );

      const documents = await Promise.all(
        objectsData.map(async (obj) => {
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
            console.warn(`Could not fetch metadata for ${obj.name}:`, error);
          }

          // Determine document type and category based on path or metadata
          // This is just an example - adjust according to your actual document structure
          const category = pathParts[2] || "general"; // Assuming path format: regulations/mica/[category]/[filename]
          const type =
            (metaData as any)["type"] ||
            (fileName.endsWith(".pdf")
              ? "PDF"
              : fileName.endsWith(".docx")
                ? "Document"
                : "Other");

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
      const statResult = await minioClient.statObject(
        DEFAULT_BUCKET,
        documentId
      );

      const url = await minioClient.presignedGetObject(
        DEFAULT_BUCKET,
        documentId,
        3600
      );

      const pathParts = documentId.split("/");
      const fileName = pathParts[pathParts.length - 1];
      const category = pathParts[2] || "general";

      const type =
        (statResult.metaData as any)["type"] ||
        (fileName.endsWith(".pdf")
          ? "PDF"
          : fileName.endsWith(".docx")
            ? "Document"
            : "Other");

      const title =
        (statResult.metaData as any)["title"] ||
        fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

      const document = {
        id: documentId,
        title: title,
        fileName: fileName,
        type: type,
        category: category,
        uploadDate: statResult.lastModified.toISOString(),
        status: (statResult.metaData as any)["status"] || "pending",
        url,
        size: statResult.size,
      };

      return safeParse(MicaDocumentSchema, document);
    } catch (error) {
      console.error(`Failed to get MiCA document ${documentId}:`, error);
      return null;
    }
  }
);
