import { getRegulationDetail } from "@/lib/queries/regulations/regulation-detail";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetAddress: string }> }
) {
  try {
    const { assetAddress } = await params;

    // Fetch the regulation data
    const regulationData = await getRegulationDetail({
      assetId: assetAddress.toLowerCase(),
      regulationType: "mica",
    });

    if (!regulationData?.mica_regulation_config) {
      return NextResponse.json(
        { error: "MiCA regulation config not found" },
        { status: 404 }
      );
    }

    // Return the MiCA regulation configuration
    return NextResponse.json(regulationData.mica_regulation_config);
  } catch (error) {
    console.error("Error fetching MiCA regulation data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
