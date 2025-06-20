"use server";

import { RegulationStatus } from "@/lib/db/regulations/schema-base-regulation-configs";
import {
  ReserveComplianceStatus,
  TokenType,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { createRegulation } from "@/lib/providers/regulations/regulation-provider";
import { withTracing } from "@/lib/utils/sentry-tracing";

export interface CreateRegulationConfigInput {
  assetId: string;
  regulationType: string;
}

export async function createRegulationConfigAction(
  input: CreateRegulationConfigInput
) {
  return withTracing("queries", "createRegulationConfigAction", async () => {
    try {
      const { assetId, regulationType } = input;

      console.log(
        `Creating ${regulationType} regulation config for asset:`,
        assetId
      );

      let regulationConfigId: string | null = null;

      if (regulationType === "mica") {
        // Create MiCA regulation config
        regulationConfigId = await createRegulation(
          {
            assetId,
            regulationType: "mica",
            status: RegulationStatus.NOT_COMPLIANT,
          },
          {
            documents: [],
            tokenType: TokenType.ELECTRONIC_MONEY_TOKEN,
            reserveStatus: ReserveComplianceStatus.PENDING_REVIEW,
          }
        );
      }

      if (regulationConfigId) {
        console.log(
          `Created ${regulationType} regulation config with ID:`,
          regulationConfigId
        );
        return {
          success: true,
          data: {
            id: regulationConfigId,
            regulationType,
            assetId,
          },
        };
      }

      return {
        success: false,
        error: `Unsupported regulation type: ${regulationType}`,
      };
    } catch (error) {
      console.error("Error creating regulation config:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  });
}
