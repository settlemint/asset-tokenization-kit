import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { z } from "zod";

const IDENTITY_COUNT_QUERY = theGraphGraphql(`
  query IdentityCount($systemId: ID!) {
    system(id: $systemId) {
      identityRegistry {
        activeIdentitiesCount
      }
      identityFactory {
        identitiesCreatedCount
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
          identitiesCreatedCount: z.number(),
        })
        .nullable(),
      identityRegistry: z
        .object({
          activeIdentitiesCount: z.number(),
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

    const identitiesCreatedCount =
      response.system?.identityFactory?.identitiesCreatedCount ?? 0;
    const activeIdentitiesCount =
      response.system?.identityRegistry?.activeIdentitiesCount ?? 0;
    const adminsCount = response.system?.adminsCount ?? 0;

    return {
      identitiesCreatedCount,
      activeIdentitiesCount,
      pendingRegistrationsCount:
        identitiesCreatedCount - activeIdentitiesCount - adminsCount,
    };
  });
