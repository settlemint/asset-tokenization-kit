import "server-only";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";
import type { Address } from "viem";

// Schema for MiCA document metadata from Hasura
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

// GraphQL query to get regulation config ID for an asset
const GET_REGULATION_CONFIG_ID = hasuraGraphql(`
  query GetRegulationConfigId($assetId: String!) {
    regulation_configs(
      where: {
        asset_id: { _eq: $assetId },
        regulation_type: { _eq: "mica" }
      },
      limit: 1
    ) {
      id
    }
  }
`);

// GraphQL query to get MICA regulation config with documents
const GET_MICA_REGULATION_CONFIG = hasuraGraphql(`
  query GetMicaRegulationConfig($regulationConfigId: String!) {
    mica_regulation_configs(
      where: {
        regulation_config_id: { _eq: $regulationConfigId }
      },
      limit: 1
    ) {
      id
      documents
    }
  }
`);

// Debug query to see all regulation configs and MiCA configs
const DEBUG_ALL_CONFIGS = hasuraGraphql(`
  query DebugAllConfigs {
    regulation_configs {
      id
      asset_id
      regulation_type
    }
    mica_regulation_configs {
      id
      regulation_config_id
      documents
    }
  }
`);

type GetRegulationConfigIdResponse = {
  regulation_configs: {
    id: string;
  }[];
};

type GetMicaRegulationConfigResponse = {
  mica_regulation_configs: {
    id: string;
    documents: any[] | null;
  }[];
};

/**
 * Fetches MiCA regulation documents for a specific asset from Hasura
 *
 * @param assetAddress - The blockchain address of the asset
 * @returns Array of MiCA document metadata
 */
export const getMicaDocuments = withTracing(
  "queries",
  "getMicaDocuments",
  async (assetAddress: Address): Promise<MicaDocument[]> => {
    console.log(
      `🔍 Fetching MiCA documents from Hasura for asset: ${assetAddress}`
    );

    try {
      // Debug: First let's see all configs in the database
      console.log(
        `🔬 DEBUG: Fetching all regulation configs and MiCA configs for debugging...`
      );
      const debugResult = await hasuraClient.request(DEBUG_ALL_CONFIGS);
      console.log(
        `🔬 DEBUG: All regulation configs:`,
        debugResult.regulation_configs
      );
      console.log(
        `🔬 DEBUG: All MiCA configs:`,
        debugResult.mica_regulation_configs
      );

      // Step 1: Get the regulation config ID for this asset
      const regulationConfigResult =
        await hasuraClient.request<GetRegulationConfigIdResponse>(
          GET_REGULATION_CONFIG_ID,
          {
            assetId: assetAddress,
          }
        );

      console.log(
        `📊 Regulation config query result for asset ${assetAddress}:`,
        regulationConfigResult
      );

      if (
        !regulationConfigResult.regulation_configs ||
        regulationConfigResult.regulation_configs.length === 0
      ) {
        console.log(`ℹ️ No regulation config found for asset ${assetAddress}`);
        return [];
      }

      const regulationConfig = regulationConfigResult.regulation_configs[0];
      console.log(
        `✅ Found regulation config ID: ${regulationConfig.id} for asset: ${assetAddress}`
      );

      // Step 2: Get the MICA regulation config with documents
      const micaConfigResult =
        await hasuraClient.request<GetMicaRegulationConfigResponse>(
          GET_MICA_REGULATION_CONFIG,
          {
            regulationConfigId: regulationConfig.id,
          }
        );

      console.log(
        `📊 MiCA config query result for regulation config ${regulationConfig.id}:`,
        micaConfigResult
      );

      if (
        !micaConfigResult.mica_regulation_configs ||
        micaConfigResult.mica_regulation_configs.length === 0
      ) {
        console.log(
          `ℹ️ No MiCA regulation config found for regulation config ${regulationConfig.id}`
        );
        return [];
      }

      const micaConfig = micaConfigResult.mica_regulation_configs[0];
      console.log(
        `✅ Found MiCA config ID: ${micaConfig.id} for regulation config: ${regulationConfig.id}`
      );

      const documentsFromHasura = micaConfig.documents;

      console.log(
        `📄 Raw documents from Hasura for asset ${assetAddress}:`,
        documentsFromHasura
      );
      console.log(
        `📄 Number of documents found: ${documentsFromHasura ? documentsFromHasura.length : 0}`
      );

      if (!documentsFromHasura || !Array.isArray(documentsFromHasura)) {
        console.log(
          `ℹ️ No documents found in MiCA config for asset ${assetAddress}`
        );
        return [];
      }

      // Let's also log what documents are found and their details
      documentsFromHasura.forEach((doc: any, index: number) => {
        console.log(`📄 Document ${index + 1}:`, {
          id: doc.id,
          title: doc.title,
          type: doc.type,
          url: doc.url,
          status: doc.status,
        });
      });

      // Transform Hasura documents to match our schema
      const documents: MicaDocument[] = documentsFromHasura.map(
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

      console.log(
        `✨ Returning ${documents.length} documents for asset ${assetAddress}`
      );
      console.log(
        `📋 Document summary:`,
        documents.map((d) => ({ title: d.title, type: d.type }))
      );

      return safeParse(t.Array(MicaDocumentSchema), documents);
    } catch (error) {
      console.error(
        `❌ Failed to fetch MiCA documents from Hasura for asset ${assetAddress}:`,
        error
      );
      return [];
    }
  }
);

/**
 * Get a specific MiCA document by ID from Hasura
 */
export const getMicaDocumentById = withTracing(
  "queries",
  "getMicaDocumentById",
  async (documentId: string): Promise<MicaDocument | null> => {
    console.log(
      `🔍 Getting MiCA document details from Hasura for: ${documentId}`
    );

    try {
      // For now, we'll need to search through all MiCA configs to find the document
      // In a future version, we could create a dedicated documents table for better querying

      const allConfigsQuery = hasuraGraphql(`
        query GetAllMicaConfigs {
          mica_regulation_configs {
            id
            documents
          }
        }
      `);

      const response = await hasuraClient.request(allConfigsQuery);

      for (const config of response.mica_regulation_configs) {
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
        `❌ Failed to get MiCA document ${documentId} from Hasura:`,
        error
      );
      return null;
    }
  }
);
