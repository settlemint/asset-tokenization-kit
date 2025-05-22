import { getMicaDocuments } from "@/lib/queries/regulations/mica-documents";
import { NextResponse } from "next/server";
import type { Address } from "viem";

type RouteParams = {
  params: {
    assetAddress: string;
  };
};

/**
 * API route to fetch MiCA documents for a specific asset
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    // Get assetAddress from params object (already available in this context)
    const assetAddress = params.assetAddress;

    // Validate asset address
    if (!assetAddress || typeof assetAddress !== "string") {
      return NextResponse.json(
        { error: "Invalid asset address" },
        { status: 400 }
      );
    }

    // Fetch MiCA documents for the asset
    const documents = await getMicaDocuments(assetAddress as Address);

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error("Error fetching MiCA documents:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
