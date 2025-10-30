import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { z } from "zod";

const TRUSTED_ISSUER_STATS_STATE_QUERY = theGraphGraphql(`
  query TrustedIssuerStatsState($trustedIssuersRegistryId: ID!) {
    trustedIssuerStatsState(id: $trustedIssuersRegistryId) {
      totalAddedTrustedIssuers
      totalActiveTrustedIssuers
      totalRemovedTrustedIssuers
    }
  }
`);

const TrustedIssuerStatsStateResponseSchema = z.object({
  trustedIssuerStatsState: z
    .object({
      totalAddedTrustedIssuers: z.coerce.number(),
      totalActiveTrustedIssuers: z.coerce.number(),
      totalRemovedTrustedIssuers: z.coerce.number(),
    })
    .nullable(),
});

export const statsTrustedIssuerStatsState =
  systemRouter.system.stats.trustedIssuerStatsState.handler(
    async ({ context }) => {
      const trustedIssuersRegistryId =
        context.system.trustedIssuersRegistry.id.toLowerCase();

      const response = await context.theGraphClient.query(
        TRUSTED_ISSUER_STATS_STATE_QUERY,
        {
          input: {
            trustedIssuersRegistryId,
          },
          output: TrustedIssuerStatsStateResponseSchema,
        }
      );

      const totalAddedTrustedIssuers =
        response.trustedIssuerStatsState?.totalAddedTrustedIssuers ?? 0;
      const totalActiveTrustedIssuers =
        response.trustedIssuerStatsState?.totalActiveTrustedIssuers ?? 0;
      const totalRemovedTrustedIssuers =
        response.trustedIssuerStatsState?.totalRemovedTrustedIssuers ?? 0;

      return {
        totalAddedTrustedIssuers,
        totalActiveTrustedIssuers,
        totalRemovedTrustedIssuers,
      };
    }
  );
