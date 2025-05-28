"use server";

import { getMicaDocuments } from "@/lib/queries/regulations/mica-documents";
import { withTracing } from "@/lib/utils/tracing";
import type { Address } from "viem";

// Re-export the MicaDocument type from the query module
export type { MicaDocument } from "@/lib/queries/regulations/mica-documents";

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

      // Call the Hasura-based query function
      const documents = await getMicaDocuments(assetAddress as Address);

      return {
        success: true,
        data: documents,
        error: null,
      };
    } catch (error) {
      console.error(
        `Failed to fetch MiCA documents for asset ${assetAddress}:`,
        error
      );

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        data: [],
      };
    }
  }
);
