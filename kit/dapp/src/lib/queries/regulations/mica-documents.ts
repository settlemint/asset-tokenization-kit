import "server-only";

import { db } from "@/lib/db";
import { regulationConfigs } from "@/lib/db/regulations/schema-base-regulation-configs";
import { micaRegulationConfigs } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";
import { and, eq } from "drizzle-orm";
import type { Address } from "viem";

// Document schema for validation
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

      // Transform database documents to match our schema
      const documents: MicaDocument[] = documentsFromDB.map(
        (doc: any, index: number) => {
          // Extract filename from URL if not provided
          let fileName = doc.fileName || doc.title || `document-${index + 1}`;
          if (!doc.fileName && doc.url) {
            try {
              const urlPath = new URL(doc.url).pathname;
              const urlFileName = urlPath.split("/").pop();
              if (urlFileName) {
                fileName = urlFileName;
              }
            } catch (error) {
              console.warn(`Could not extract filename from URL: ${doc.url}`);
            }
          }

          // Determine category from type or filename
          const category = doc.category || doc.type || "general";

          // Generate upload date if not provided
          const uploadDate =
            doc.uploadDate || doc.created_at || new Date().toISOString();

          // Estimate file size if not provided (default to 0)
          const size = doc.size || 0;

          return {
            id: doc.id || doc.url || `doc-${index}`,
            title: doc.title || fileName,
            fileName: fileName,
            type: doc.type || "document",
            category: category,
            uploadDate: uploadDate,
            status: doc.status || "pending",
            url: doc.url,
            size: size,
          };
        }
      );

      // Sort documents by upload date (newest first)
      documents.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
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
 * Get a specific MiCA document by ID using Drizzle
 */
export const getMicaDocumentById = withTracing(
  "queries",
  "getMicaDocumentById",
  async (documentId: string): Promise<MicaDocument | null> => {
    console.log(
      `🔍 Getting MiCA document details from database for: ${documentId}`
    );

    try {
      // Get all MiCA configs and search through their documents
      const allConfigs = await db
        .select({
          documents: micaRegulationConfigs.documents,
        })
        .from(micaRegulationConfigs);

      for (const config of allConfigs) {
        if (config.documents && Array.isArray(config.documents)) {
          const document = config.documents.find(
            (doc: any) => doc.id === documentId || doc.url === documentId
          );

          if (document) {
            // Transform the document to match our schema
            const fileName = document.fileName || document.title || "document";
            const category = document.category || document.type || "general";
            const uploadDate =
              document.uploadDate ||
              document.created_at ||
              new Date().toISOString();
            const size = document.size || 0;

            const transformedDocument = {
              id: document.id || document.url || documentId,
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

      console.log(`ℹ️ Document not found: ${documentId}`);
      return null;
    } catch (error) {
      console.error(
        `❌ Failed to get MiCA document ${documentId} from database:`,
        error
      );
      return null;
    }
  }
);
