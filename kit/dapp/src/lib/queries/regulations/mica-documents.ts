import "server-only";

import { db } from "@/lib/db";
import { regulationConfigs } from "@/lib/db/regulations/schema-base-regulation-configs";
import { micaRegulationConfigs } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";
import { and, eq } from "drizzle-orm";
import type { Address } from "viem";

// Import MinIO client for fresh URL generation
import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";

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
  description: t.Optional(t.String()),
});

export type MicaDocument = StaticDecode<typeof MicaDocumentSchema>;

/**
 * Helper function to get file metadata from HTTP HEAD request
 * This is more reliable than MinIO direct access since presigned URLs always work
 */
async function getFileMetadataFromURL(url: string): Promise<{
  uploadDate: string;
  size: number;
} | null> {
  try {
    // Make a HEAD request to get file metadata without downloading the file
    const response = await fetch(url, {
      method: "HEAD",
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    // Get file size from Content-Length header
    const contentLength = response.headers.get("content-length");
    const size = contentLength ? parseInt(contentLength, 10) : 0;

    // Get last modified date from Last-Modified header, fallback to current time
    const lastModified = response.headers.get("last-modified");
    let uploadDate = new Date().toISOString();

    if (lastModified) {
      try {
        uploadDate = new Date(lastModified).toISOString();
      } catch (error) {
        // Use current time if date parsing fails
        uploadDate = new Date().toISOString();
      }
    }

    return {
      uploadDate,
      size: size > 0 ? size : 0,
    };
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

      // Check if any documents are missing file size and migrate them if needed
      const documentsNeedingSizeMigration = processedDocuments.filter(
        (doc: any) => !doc.size || doc.size === 0
      );

      if (documentsNeedingSizeMigration.length > 0) {
        processedDocuments = await migrateDocumentFileSizes(
          regulationConfigResult[0].id,
          processedDocuments,
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

          // Use stored upload date from database if available, otherwise try to get from URL or current time
          let uploadDate = doc.uploadDate; // Start with stored value (could be undefined)
          let size = doc.size && doc.size > 0 ? doc.size : 0; // Use stored size if available and > 0

          // If we don't have uploadDate stored in database, try to get it from URL
          if (!doc.uploadDate && doc.url) {
            try {
              const urlFileMetadata = await getFileMetadataFromURL(doc.url);
              if (urlFileMetadata) {
                uploadDate = urlFileMetadata.uploadDate;

                // Also get size if we don't have it
                if (!doc.size || doc.size === 0) {
                  size = urlFileMetadata.size;
                }
              } else {
                // Fallback to URL date extraction if URL metadata lookup fails
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
          } else if ((!doc.size || doc.size === 0) && doc.url) {
            // We have uploadDate but missing size, try to get size from URL
            try {
              const urlSizeMetadata = await getFileMetadataFromURL(doc.url);
              if (urlSizeMetadata && urlSizeMetadata.size > 0) {
                size = urlSizeMetadata.size;
              }
            } catch (error) {
              // Continue with default size
            }
          }

          // Final fallback to current time only if we still don't have a date
          if (!uploadDate) {
            uploadDate = new Date().toISOString();
          }

          // Generate fresh presigned URL from the stored URL
          let freshUrl = doc.url; // Default to stored URL
          if (doc.url) {
            try {
              const newUrl = await generateFreshPresignedUrl(doc.url);
              if (newUrl) {
                freshUrl = newUrl;
                console.log(`Refreshed URL for document: ${doc.title}`);
              } else {
                console.warn(
                  `Could not refresh URL for document: ${doc.title}, using stored URL`
                );
              }
            } catch (error) {
              console.error(
                `Error refreshing URL for document: ${doc.title}`,
                error
              );
              // Continue with stored URL as fallback
            }
          }

          const transformedDoc = {
            id: doc.url || `doc-${index}`, // Use original URL as ID since ID is not stored in DB
            title: doc.title || fileName,
            fileName: fileName,
            type: doc.type || "document",
            category: category,
            uploadDate: uploadDate,
            status: doc.status || "pending",
            url: freshUrl, // Use fresh URL instead of stored URL
            size: size,
            description: doc.description || "",
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

            // Use stored upload date from database if available, otherwise try to get from URL
            let uploadDate = document.uploadDate; // Start with stored value (could be undefined)
            let size = document.size && document.size > 0 ? document.size : 0; // Use stored size if available and > 0

            // If we don't have uploadDate stored in database, try to get it from URL
            if (!document.uploadDate && document.url) {
              try {
                const urlFileMetadata = await getFileMetadataFromURL(
                  document.url
                );
                if (urlFileMetadata) {
                  uploadDate = urlFileMetadata.uploadDate;

                  // Also get size if we don't have it
                  if (!document.size || document.size === 0) {
                    size = urlFileMetadata.size;
                  }
                } else {
                  // Fallback to URL date extraction if URL metadata lookup fails
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
            } else if (
              (!document.size || document.size === 0) &&
              document.url
            ) {
              // We have uploadDate but missing size, try to get size from URL
              try {
                const urlSizeMetadata = await getFileMetadataFromURL(
                  document.url
                );
                if (urlSizeMetadata && urlSizeMetadata.size > 0) {
                  size = urlSizeMetadata.size;
                }
              } catch (error) {
                // Continue with default size
              }
            }

            // Final fallback to current time only if we still don't have a date
            if (!uploadDate) {
              uploadDate = new Date().toISOString();
            }

            // Generate fresh presigned URL from the stored URL
            let freshUrl = document.url; // Default to stored URL
            if (document.url) {
              try {
                const newUrl = await generateFreshPresignedUrl(document.url);
                if (newUrl) {
                  freshUrl = newUrl;
                  console.log(`Refreshed URL for document: ${document.title}`);
                } else {
                  console.warn(
                    `Could not refresh URL for document: ${document.title}, using stored URL`
                  );
                }
              } catch (error) {
                console.error(
                  `Error refreshing URL for document: ${document.title}`,
                  error
                );
                // Continue with stored URL as fallback
              }
            }

            const transformedDocument = {
              id: document.url || documentId,
              title: document.title || fileName,
              fileName: fileName,
              type: document.type || "document",
              category: category,
              uploadDate: uploadDate,
              status: document.status || "pending",
              url: freshUrl, // Use fresh URL instead of stored URL
              size: size,
              description: document.description || "",
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
 * Helper function to migrate existing documents with proper upload dates from URL metadata
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

      // Try to get upload date from URL metadata
      if (doc.url) {
        try {
          const urlMetadata = await getFileMetadataFromURL(doc.url);
          if (urlMetadata) {
            migratedUploadDate = urlMetadata.uploadDate;
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

/**
 * Helper function to migrate existing documents with proper file sizes from URL metadata
 * This should be called when documents are missing size in the database
 */
async function migrateDocumentFileSizes(
  regulationConfigId: string,
  documents: any[],
  assetAddress: string
): Promise<any[]> {
  let needsUpdate = false;
  const updatedDocuments = await Promise.all(
    documents.map(async (doc: any) => {
      // Skip if document already has size
      if (doc.size && doc.size > 0) {
        return doc;
      }

      let migratedSize = null;

      // Try to get file size from URL metadata
      if (doc.url) {
        try {
          const urlMetadata = await getFileMetadataFromURL(doc.url);
          if (urlMetadata && urlMetadata.size) {
            migratedSize = urlMetadata.size;
          }
        } catch (error) {
          // Continue without size if URL metadata lookup fails
        }
      }

      if (migratedSize && migratedSize > 0) {
        needsUpdate = true;
        return {
          ...doc,
          size: migratedSize,
        };
      }

      return doc;
    })
  );

  // Update the database if we found new file sizes
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

/**
 * Helper function to generate a fresh presigned URL from an existing URL
 * Extracts the object name and generates a new presigned URL that won't be expired
 */
async function generateFreshPresignedUrl(
  oldUrl: string
): Promise<string | null> {
  try {
    // Extract object name from the old URL
    let objectName: string | null = null;

    // Try to extract object name from URL path
    try {
      const url = new URL(oldUrl);
      const pathParts = url.pathname.split("/");

      // Look for the object name in the path
      // MinIO URLs typically have format: /bucket-name/object-name or /object-name
      if (pathParts.length >= 2) {
        // Remove empty first element and potential bucket name
        const cleanParts = pathParts.filter(
          (part) => part !== "" && part !== DEFAULT_BUCKET
        );
        if (cleanParts.length > 0) {
          objectName = cleanParts.join("/");
        }
      }
    } catch (error) {
      // If URL parsing fails, try to extract from query parameters or other methods
      console.log("URL parsing failed, trying alternative extraction methods");
    }

    // Alternative: Try to extract from URL patterns commonly found in MinIO presigned URLs
    if (!objectName) {
      // Look for common MinIO URL patterns
      const patterns = [
        /\/uploads\/(.+?)\?/, // Pattern: /uploads/path/file.pdf?X-Amz-...
        /\/([^?]+)\?X-Amz-/, // Pattern: /path/file.pdf?X-Amz-...
        /uploads\/(.+)$/, // Pattern: uploads/path/file.pdf (without query)
      ];

      for (const pattern of patterns) {
        const match = oldUrl.match(pattern);
        if (match && match[1]) {
          objectName = match[1];
          break;
        }
      }
    }

    if (!objectName) {
      console.error(`Could not extract object name from URL: ${oldUrl}`);
      return null;
    }

    console.log(`Generating fresh presigned URL for object: ${objectName}`);

    // Generate fresh presigned URL (1 hour expiry)
    const freshUrl = await minioClient.presignedGetObject(
      DEFAULT_BUCKET,
      objectName,
      3600 // 1 hour
    );

    console.log(`Generated fresh URL: ${freshUrl.substring(0, 100)}...`);
    return freshUrl;
  } catch (error) {
    console.error("Error generating fresh presigned URL:", error);
    return null;
  }
}
