import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { z } from "zod";

const IDENTITY_COUNT_QUERY = theGraphGraphql(`
  query IdentityCount($systemId: ID!) {
    system(id: $systemId) {
      identityRegistry {
        activeUserIdentitiesCount
      }
      identityFactory {
        userIdentitiesCreatedCount
      }
      adminsCount
    }
  }
`);

// Schema for the GraphQL response
const IdentityCountResponseSchema = z.object({
  system: z
    .object({
      identityFactory: z
        .object({
          userIdentitiesCreatedCount: z.number(),
        })
        .nullable(),
      identityRegistry: z
        .object({
          activeUserIdentitiesCount: z.number(),
        })
        .nullable(),
      adminsCount: z.number(),
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
      response.system?.identityFactory?.userIdentitiesCreatedCount ?? 0;
    const activeUserIdentitiesCount =
      response.system?.identityRegistry?.activeUserIdentitiesCount ?? 0;

    return {
      userIdentitiesCreatedCount,
      activeUserIdentitiesCount,
      pendingIdentitiesCount:
        userIdentitiesCreatedCount - activeUserIdentitiesCount,
    };
  });
