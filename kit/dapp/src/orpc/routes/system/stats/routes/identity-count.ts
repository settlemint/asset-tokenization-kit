import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import * as z from "zod";

const IDENTITY_COUNT_QUERY = theGraphGraphql(`
  query IdentityCount($systemId: ID!) {
    system(id: $systemId) {
      identityStats {
        userIdentitiesCreatedCount
        activeUserIdentitiesCount
        removedUserIdentitiesCount
        pendingUserIdentitiesCount
      }
    }
  }
`);

// Schema for the GraphQL response
const IdentityCountResponseSchema = z.object({
  system: z
    .object({
      identityStats: z
        .object({
          userIdentitiesCreatedCount: z.number(),
          activeUserIdentitiesCount: z.number(),
          removedUserIdentitiesCount: z.number(),
          pendingUserIdentitiesCount: z.number(),
        })
        .nullable(),
    })
    .nullable(),
});

export const statsIdentityCount =
  systemRouter.system.stats.identityCount.handler(async ({ context }) => {
    // Fetch identity count from TheGraph
    const response = await context.theGraphClient.query(IDENTITY_COUNT_QUERY, {
      input: {
        systemId: context.system.id.toLowerCase(),
      },
      output: IdentityCountResponseSchema,
    });

    const userIdentitiesCreatedCount =
      response.system?.identityStats?.userIdentitiesCreatedCount ?? 0;
    const activeUserIdentitiesCount =
      response.system?.identityStats?.activeUserIdentitiesCount ?? 0;
    const pendingRegistrationsCount =
      response.system?.identityStats?.pendingUserIdentitiesCount ?? 0;

    return {
      userIdentitiesCreatedCount,
      activeUserIdentitiesCount,
      pendingRegistrationsCount,
    };
  });
