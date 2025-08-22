import { verifyCollateralClaim } from "@/orpc/routes/token/routes/mutations/collateral/token.update-collateral-simple";
import { portalClient } from "@/lib/settlemint/portal";

export async function GET() {
  const TOKEN_CONTRACT = "0x51A7b299f8c7C750F830be2E16dA2c6bA7D0467A";

  console.log("🔍 Starting collateral verification via API...");

  try {
    // Mock a Portal client context
    const mockPortalClient = {
      query: async (query: any, variables: any) => {
        return await portalClient.request(query, variables);
      },
    };

    await verifyCollateralClaim(TOKEN_CONTRACT, mockPortalClient);

    return Response.json({
      success: true,
      message: "Verification completed - check server logs for details",
    });
  } catch (error) {
    console.error("❌ Verification failed:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
