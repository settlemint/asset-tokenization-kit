import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { z } from "zod";

const CLAIMS_STATS_STATE_QUERY = theGraphGraphql(`
  query ClaimsStatsState($topicSchemeRegistryId: ID!) {
    claimsStatsState(id: $topicSchemeRegistryId) {
      totalIssuedClaims
      totalActiveClaims
      totalRemovedClaims
      totalRevokedClaims
    }
  }
`);

const ClaimsStatsStateResponseSchema = z.object({
  claimsStatsState: z
    .object({
      totalIssuedClaims: z.coerce.number(),
      totalActiveClaims: z.coerce.number(),
      totalRemovedClaims: z.coerce.number(),
      totalRevokedClaims: z.coerce.number(),
    })
    .nullable(),
});

export const statsClaimsStatsState =
  systemRouter.system.stats.claimsStatsState.handler(async ({ context }) => {
    const topicSchemeRegistryId =
      context.system.topicSchemeRegistry.id.toLowerCase();

    const response = await context.theGraphClient.query(
      CLAIMS_STATS_STATE_QUERY,
      {
        input: {
          topicSchemeRegistryId,
        },
        output: ClaimsStatsStateResponseSchema,
      }
    );

    const totalIssuedClaims = response.claimsStatsState?.totalIssuedClaims ?? 0;
    const totalActiveClaims = response.claimsStatsState?.totalActiveClaims ?? 0;
    const totalRemovedClaims =
      response.claimsStatsState?.totalRemovedClaims ?? 0;
    const totalRevokedClaims =
      response.claimsStatsState?.totalRevokedClaims ?? 0;

    return {
      totalIssuedClaims,
      totalActiveClaims,
      totalRemovedClaims,
      totalRevokedClaims,
    };
  });
