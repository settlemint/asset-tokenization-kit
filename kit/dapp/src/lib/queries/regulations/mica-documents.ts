import "server-only";

import { db } from "@/lib/db";
import { regulationConfigs } from "@/lib/db/regulations/schema-base-regulation-configs";
import { micaRegulationConfigs } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";
import { and, eq } from "drizzle-orm";
import type { Address } from "viem";

// Extended document schema for UI purposes (includes generated fields)
const MicaDocumentSchema = t.Object({
  id: t.String(),
  title: t.String(),
  fileName: t.String(),
  type: t.String(),
  category: t.String(),
  uploadDate: t.String(),
  status: t.String(),
  url: t.String(),
  size: t.Number(),
});

export type MicaDocument = StaticDecode<typeof MicaDocumentSchema>;

/**
 * Helper function to get file metadata from MinIO
 */
async function getFileMetadataFromMinIO(
  url: string,
  assetAddress?: string
): Promise<{
  uploadDate: string;
  size: number;
} | null> {
  try {
    // Extract object name from URL or use URL as object path
    let objectName = url;

    // If it's a presigned URL, extract the object name
    if (url.includes("?")) {
      const urlParts = url.split("?")[0];
      const pathParts = urlParts.split("/");

      // Find regulations/mica path in URL
      const micaIndex = pathParts.findIndex((part) => part === "mica");
      if (
        micaIndex !== -1 &&
        micaIndex > 0 &&
        pathParts[micaIndex - 1] === "regulations"
      ) {
        objectName = pathParts.slice(micaIndex - 1).join("/");
      } else {
        // Fallback: use last part of URL as filename and assume regulations/mica path
        const fileName = pathParts[pathParts.length - 1];
        if (assetAddress) {
          objectName = `regulations/mica/${assetAddress}/${fileName}`;
        } else {
          objectName = `regulations/mica/${fileName}`;
        }
      }
    }

    // Try different possible object names/paths including asset address variations
    const possiblePaths = [
      objectName,
      // Try with asset address if provided
      ...(assetAddress
        ? [
            `regulations/mica/${assetAddress}/${objectName}`,
            `regulations/mica/${assetAddress}/${objectName.split("/").pop()}`, // just filename
          ]
        : []),
      // Legacy paths without asset address
      `regulations/mica/${objectName}`,
      `regulations/mica/${objectName.split("/").pop()}`, // just filename
      objectName.startsWith("regulations/")
        ? objectName
        : `regulations/mica/${objectName}`,
    ];

    for (const path of possiblePaths) {
      try {
        const statResult = await minioClient.statObject(DEFAULT_BUCKET, path);

        // Try to get upload date from metadata first, fallback to lastModified
        let uploadDate = statResult.lastModified.toISOString();
        if (statResult.metaData && statResult.metaData["upload-time"]) {
          uploadDate = statResult.metaData["upload-time"];
        }

        return {
          uploadDate,
          size: statResult.size,
        };
      } catch (error) {
        // Continue to next possible path
        continue;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Helper function to extract upload date from URL path
 */
function extractUploadDateFromUrl(url: string): string | null {
  try {
    // Look for date patterns in the URL path (YYYY-MM-DD format)
    const datePattern = /(\d{4}-\d{2}-\d{2})/;
    const match = url.match(datePattern);

    if (match && match[1]) {
      const dateStr = match[1];

      // Create a date from the extracted date string
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        // Since we only have the date from URL, set a reasonable time (noon) for that specific date
        // This gives us a proper timestamp for the actual upload date, not mixing with today's time
        date.setHours(12, 0, 0, 0); // Set to noon of the upload date

        const finalTimestamp = date.toISOString();
        return finalTimestamp;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches MiCA regulation documents for a specific asset using Drizzle
 *
 * @param assetAddress - The blockchain address of the asset
 * @returns Array of MiCA document metadata
 */
export const getMicaDocuments = withTracing(
  "queries",
  "getMicaDocuments",
  async (assetAddress: Address): Promise<MicaDocument[]> => {
    try {
      // Get the regulation config for this asset
      const regulationConfigResult = await db
        .select({
          id: regulationConfigs.id,
        })
        .from(regulationConfigs)
        .where(
          and(
            eq(regulationConfigs.assetId, assetAddress),
            eq(regulationConfigs.regulationType, "mica")
          )
        )
        .limit(1);

      if (!regulationConfigResult[0]) {
        return [];
      }

      // Get the MiCA config for this regulation
      const micaConfigResult = await db
        .select({
          documents: micaRegulationConfigs.documents,
        })
        .from(micaRegulationConfigs)
        .where(
          eq(
            micaRegulationConfigs.regulationConfigId,
            regulationConfigResult[0].id
          )
        )
        .limit(1);

      if (!micaConfigResult[0]) {
        return [];
      }

      const documentsFromDB = micaConfigResult[0].documents;

      if (!documentsFromDB || !Array.isArray(documentsFromDB)) {
        return [];
      }

      // Check if any documents are missing uploadDate and migrate them if needed
      const documentsNeedingMigration = documentsFromDB.filter(
        (doc: any) => !doc.uploadDate
      );
      let processedDocuments = documentsFromDB;

      if (documentsNeedingMigration.length > 0) {
        processedDocuments = await migrateDocumentUploadDates(
          regulationConfigResult[0].id,
          documentsFromDB,
          assetAddress
        );
      }

      // Transform database documents to match our schema
      const documents: MicaDocument[] = await Promise.all(
        processedDocuments.map(async (doc: any, index: number) => {
          // Generate filename from stored fileName, title, or URL
          let fileName = doc.fileName || doc.title || `document-${index + 1}`;
          if (!doc.fileName && doc.url) {
            try {
              const urlPath = new URL(doc.url).pathname;
              const urlFileName = urlPath.split("/").pop();
              if (urlFileName) {
                fileName = urlFileName;
              }
            } catch (error) {
              // Continue with default filename
            }
          }

          // Use type as category since category is not stored in DB
          const category = doc.type || "general";

          // Use stored upload date from database if available, otherwise try to get from MinIO or current time
          let uploadDate = doc.uploadDate; // Start with stored value (could be undefined)
          let size = doc.size || 0; // Use stored size if available

          // If we don't have uploadDate stored in database, try to get it from MinIO
          if (!doc.uploadDate && doc.url) {
            try {
              const fileMetadata = await getFileMetadataFromMinIO(
                doc.url,
                assetAddress
              );
              if (fileMetadata) {
                uploadDate = fileMetadata.uploadDate;

                // Also get size if we don't have it
                if (!doc.size) {
                  size = fileMetadata.size;
                }
              } else {
                // Fallback to URL date extraction if MinIO metadata lookup fails
                const urlDate = extractUploadDateFromUrl(doc.url);
                if (urlDate) {
                  uploadDate = urlDate;
                }
              }
            } catch (error) {
              // Last resort: try URL extraction
              const urlDate = extractUploadDateFromUrl(doc.url);
              if (urlDate) {
                uploadDate = urlDate;
              }
            }
          } else if (!doc.size && doc.url) {
            // We have uploadDate but missing size, try to get size from MinIO
            try {
              const fileMetadata = await getFileMetadataFromMinIO(
                doc.url,
                assetAddress
              );
              if (fileMetadata && fileMetadata.size) {
                size = fileMetadata.size;
              }
            } catch (error) {
              // Continue with default size
            }
          }

          // Final fallback to current time only if we still don't have a date
          if (!uploadDate) {
            uploadDate = new Date().toISOString();
          }

          const transformedDoc = {
            id: doc.url || `doc-${index}`, // Use URL as ID since ID is not stored in DB
            title: doc.title || fileName,
            fileName: fileName,
            type: doc.type || "document",
            category: category,
            uploadDate: uploadDate,
            status: doc.status || "pending",
            url: doc.url,
            size: size,
          };

          return transformedDoc;
        })
      );

      // Sort documents by upload date (newest first)
      documents.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );

      const result = safeParse(t.Array(MicaDocumentSchema), documents);

      return result;
    } catch (error) {
      return [];
    }
  }
);

/**
 * Get a specific MiCA document by ID using Drizzle
 */
export const getMicaDocumentById = withTracing(
  "queries",
  "getMicaDocumentById",
  async (documentId: string): Promise<MicaDocument | null> => {
    try {
      // Get all MiCA configs and search through their documents
      const allConfigs = await db
        .select({
          documents: micaRegulationConfigs.documents,
          regulationConfigId: micaRegulationConfigs.regulationConfigId,
        })
        .from(micaRegulationConfigs);

      for (const config of allConfigs) {
        if (config.documents && Array.isArray(config.documents)) {
          const document = config.documents.find(
            (doc: any) => doc.url === documentId // Use URL for matching since ID is not stored
          );

          if (document) {
            // Get the asset address from the regulation config
            let assetAddress: string | null = null;
            try {
              const regulationConfig = await db
                .select({ assetId: regulationConfigs.assetId })
                .from(regulationConfigs)
                .where(eq(regulationConfigs.id, config.regulationConfigId))
                .limit(1);

              assetAddress = regulationConfig[0]?.assetId || null;
            } catch (error) {
              // Continue with default asset address
            }

            // Generate fields that don't exist in the database schema
            let fileName = document.title || "document";
            if (document.url) {
              try {
                const urlPath = new URL(document.url).pathname;
                const urlFileName = urlPath.split("/").pop();
                if (urlFileName) {
                  fileName = urlFileName;
                }
              } catch (error) {
                // Continue with default filename
              }
            }

            const category = document.type || "general";

            // Use stored upload date from database if available, otherwise try to get from MinIO
            let uploadDate = document.uploadDate; // Start with stored value (could be undefined)
            let size = document.size || 0; // Use stored size if available

            // If we don't have uploadDate stored in database, try to get it from MinIO
            if (!document.uploadDate && document.url) {
              try {
                const fileMetadata = await getFileMetadataFromMinIO(
                  document.url,
                  assetAddress || undefined
                );
                if (fileMetadata) {
                  uploadDate = fileMetadata.uploadDate;

                  // Also get size if we don't have it
                  if (!document.size) {
                    size = fileMetadata.size;
                  }
                } else {
                  // Fallback to URL date extraction if MinIO metadata lookup fails
                  const urlDate = extractUploadDateFromUrl(document.url);
                  if (urlDate) {
                    uploadDate = urlDate;
                  }
                }
              } catch (error) {
                // Last resort: try URL extraction
                const urlDate = extractUploadDateFromUrl(document.url);
                if (urlDate) {
                  uploadDate = urlDate;
                }
              }
            } else if (!document.size && document.url) {
              // We have uploadDate but missing size, try to get size from MinIO
              try {
                const fileMetadata = await getFileMetadataFromMinIO(
                  document.url,
                  assetAddress || undefined
                );
                if (fileMetadata && fileMetadata.size) {
                  size = fileMetadata.size;
                }
              } catch (error) {
                // Continue with default size
              }
            }

            // Final fallback to current time only if we still don't have a date
            if (!uploadDate) {
              uploadDate = new Date().toISOString();
            }

            const transformedDocument = {
              id: document.url || documentId,
              title: document.title || fileName,
              fileName: fileName,
              type: document.type || "document",
              category: category,
              uploadDate: uploadDate,
              status: document.status || "pending",
              url: document.url,
              size: size,
            };

            return safeParse(MicaDocumentSchema, transformedDocument);
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }
);

/**
 * Helper function to migrate existing documents with proper upload dates from MinIO
 * This should be called when documents are missing uploadDate in the database
 */
async function migrateDocumentUploadDates(
  regulationConfigId: string,
  documents: any[],
  assetAddress: string
): Promise<any[]> {
  let needsUpdate = false;
  const updatedDocuments = await Promise.all(
    documents.map(async (doc: any) => {
      // Skip if document already has uploadDate
      if (doc.uploadDate) {
        return doc;
      }

      let migratedUploadDate = null;

      // Try to get upload date from MinIO
      if (doc.url) {
        try {
          const fileMetadata = await getFileMetadataFromMinIO(
            doc.url,
            assetAddress
          );
          if (fileMetadata) {
            migratedUploadDate = fileMetadata.uploadDate;
          } else {
            // Fallback to URL date extraction
            const urlDate = extractUploadDateFromUrl(doc.url);
            if (urlDate) {
              migratedUploadDate = urlDate;
            }
          }
        } catch (error) {
          // Try URL extraction as last resort
          const urlDate = extractUploadDateFromUrl(doc.url);
          if (urlDate) {
            migratedUploadDate = urlDate;
          }
        }
      }

      if (migratedUploadDate) {
        needsUpdate = true;
        return {
          ...doc,
          uploadDate: migratedUploadDate,
        };
      }

      return doc;
    })
  );

  // Update the database if we found new upload dates
  if (needsUpdate) {
    try {
      await db
        .update(micaRegulationConfigs)
        .set({
          documents: updatedDocuments,
        })
        .where(
          eq(micaRegulationConfigs.regulationConfigId, regulationConfigId)
        );
    } catch (error) {
      // Return original documents if update fails
      return documents;
    }
  }

  return updatedDocuments;
}
