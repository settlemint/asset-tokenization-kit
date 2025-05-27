import { RegulationStatus } from "@/lib/db/regulations/schema-base-regulation-configs";
import { createRegulation } from "@/lib/providers/regulations/regulation-provider";
import { normalizeAddress } from "@/lib/utils/typebox/address";
import { NextRequest, NextResponse } from "next/server";
import type { Address } from "viem";

async function createMicaConfigForAsset(assetId: string): Promise<string> {
  console.log(`Creating MiCA regulation config for asset: ${assetId}`);

  try {
    const reserveComposition = {
      bankDeposits: 0,
      governmentBonds: 0,
      highQualityLiquidAssets: 0,
      corporateBonds: 0,
      centralBankAssets: 0,
      commodities: 0,
      otherAssets: 0,
    };

    const regulationId = await createRegulation(
      {
        assetId: normalizeAddress(assetId as Address),
        regulationType: "mica",
        status: RegulationStatus.NOT_COMPLIANT, // Initially not compliant until configured
      },
      {
        // MiCA-specific default config - store as JSON strings
        documents: [],
        tokenType: "e-money-token", // Default to e-money token
        reserveStatus: "pending_setup",
        reserveComposition: JSON.stringify(reserveComposition), // Convert to JSON string
      }
    );

    console.log(
      `Successfully created MiCA regulation config with ID: ${regulationId}`
    );
    return regulationId;
  } catch (error) {
    console.error("Error creating MiCA regulation config:", error);
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assetAddress: string }> }
) {
  try {
    const { assetAddress } = await params;

    if (!assetAddress) {
      return NextResponse.json(
        { error: "Asset address is required" },
        { status: 400 }
      );
    }

    console.log(`Creating MiCA config for asset: ${assetAddress}`);

    const regulationId = await createMicaConfigForAsset(assetAddress);

    return NextResponse.json({
      success: true,
      message: `MiCA regulation config created successfully`,
      regulationId,
      assetAddress,
    });
  } catch (error) {
    console.error("Error in create MiCA config API:", error);

    return NextResponse.json(
      {
        error: "Failed to create MiCA regulation config",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
