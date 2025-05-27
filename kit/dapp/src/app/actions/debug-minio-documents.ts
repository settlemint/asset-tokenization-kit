"use server";

import { client as minioClient } from "@/lib/settlemint/minio";
import { withTracing } from "@/lib/utils/tracing";

// Default bucket name
const DEFAULT_BUCKET = "uploads";

export const debugMinioDocumentsAction = withTracing(
  "queries",
  "debugMinioDocumentsAction",
  async () => {
    try {
      console.log(`🔍 DEBUG: Listing ALL objects in bucket: ${DEFAULT_BUCKET}`);

      // List ALL objects in the bucket
      const allObjectsStream = minioClient.listObjects(
        DEFAULT_BUCKET,
        "",
        true
      );
      const allObjects: any[] = [];

      for await (const obj of allObjectsStream) {
        allObjects.push(obj);
      }

      console.log(`📊 Found ${allObjects.length} total objects in bucket`);

      // Group objects by prefix for better analysis
      const objectsByPrefix: Record<string, any[]> = {};

      for (const obj of allObjects) {
        const pathParts = obj.name.split("/");
        const prefix = pathParts.length > 1 ? pathParts[0] : "root";

        if (!objectsByPrefix[prefix]) {
          objectsByPrefix[prefix] = [];
        }
        objectsByPrefix[prefix].push(obj);
      }

      console.log(`📋 Objects grouped by prefix:`);
      for (const [prefix, objects] of Object.entries(objectsByPrefix)) {
        console.log(`  ${prefix}: ${objects.length} objects`);
        objects.forEach((obj) => {
          console.log(
            `    - ${obj.name} (${obj.size} bytes, ${obj.lastModified})`
          );
        });
      }

      // Also check for documents with metadata
      const documentsWithMetadata: any[] = [];

      for (const obj of allObjects) {
        try {
          const stat = await minioClient.statObject(DEFAULT_BUCKET, obj.name);
          const meta = stat.metaData || {};

          if (Object.keys(meta).length > 0) {
            documentsWithMetadata.push({
              name: obj.name,
              metadata: meta,
              size: obj.size,
              lastModified: obj.lastModified,
            });
          }
        } catch (error) {
          // Skip objects where metadata can't be accessed
        }
      }

      console.log(
        `📋 Documents with metadata (${documentsWithMetadata.length}):`
      );
      documentsWithMetadata.forEach((doc) => {
        console.log(`  ${doc.name}:`, doc.metadata);
      });

      return {
        success: true,
        data: {
          totalObjects: allObjects.length,
          objectsByPrefix,
          documentsWithMetadata,
          allObjects: allObjects.map((obj) => ({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified?.toISOString(),
          })),
        },
      };
    } catch (error) {
      console.error("Error debugging MinIO documents:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        data: null,
      };
    }
  }
);
