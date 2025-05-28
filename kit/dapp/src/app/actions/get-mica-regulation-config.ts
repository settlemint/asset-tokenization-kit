"use server";

import { RegulationStatus } from "@/lib/db/regulations/schema-base-regulation-configs";
import {
  ReserveComplianceStatus,
  TokenType,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { createRegulation } from "@/lib/providers/regulations/regulation-provider";
import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Address } from "viem";

export async function getMicaRegulationConfigAction(
  assetAddress: string,
  assetType: AssetType
) {
  try {
    // Use the proper regulation detail query that first finds the base regulation config
    // for this asset, then gets the MiCA-specific config
    let regulationData = await getRegulationDetail({
      assetId: assetAddress as Address,
      regulationType: "mica",
    });

    // If no MiCA regulation config exists, create a default one
    if (!regulationData) {
      // Validate that MiCA is supported for this asset type before creating config
      if (assetType !== "stablecoin" && assetType !== "deposit") {
        return {
          success: false,
          error: `MiCA regulation is not applicable to ${assetType} assets. MiCA only applies to stablecoins and deposits.`,
          data: null,
        };
      }

      console.log(
        `No MiCA regulation config found for asset ${assetAddress}, creating default config`
      );

      const reserveComposition = {
        bankDeposits: 0,
        governmentBonds: 0,
        highQualityLiquidAssets: 0,
        corporateBonds: 0,
        centralBankAssets: 0,
        commodities: 0,
        otherAssets: 0,
      };

      // Create a default MiCA regulation config
      await createRegulation(
        {
          assetId: assetAddress as Address,
          regulationType: "mica",
          status: RegulationStatus.NOT_COMPLIANT, // Initially not compliant until configured
        },
        {
          // MiCA-specific default config
          documents: [],
          tokenType: TokenType.ELECTRONIC_MONEY_TOKEN, // Default to e-money token
          reserveStatus: ReserveComplianceStatus.PENDING_REVIEW,
          reserveComposition: JSON.stringify(reserveComposition), // Convert to JSON string
        }
      );

      // Now fetch the newly created config
      regulationData = await getRegulationDetail({
        assetId: assetAddress as Address,
        regulationType: "mica",
      });

      if (!regulationData) {
        return {
          success: false,
          error: "Failed to create and retrieve MiCA regulation configuration",
          data: null,
        };
      }
    }

    return {
      success: true,
      data: regulationData.mica_regulation_config,
    };
  } catch (error) {
    console.error("Error fetching MiCA regulation config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: null,
    };
  }
}
