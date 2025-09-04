import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import { TrustedIssuerListOutputSchema } from "@/orpc/routes/system/trusted-issuers/routes/trusted-issuer.list.schema";
import {
  TrustedIssuerListResponseSchema,
  type TrustedIssuerListOutput,
} from "./trusted-issuer.list.schema";

/**
 * GraphQL query to fetch all trusted issuers from the subgraph
 * Retrieves issuer details including their assigned claim topics
 */
const TRUSTED_ISSUERS_QUERY = theGraphGraphql(
  `
  query GetTrustedIssuers($registryAddress: String!) {
    trustedIssuers(
      where: { registry: $registryAddress }
      orderBy: id
      orderDirection: asc
    ) @fetchAll {
      id
      deployedInTransaction
      claimTopics {
        id
        topicId
        name
        signature
      }
      account {
        id
      }
    }
  }
`,
  []
);

/**
 * List all trusted issuers from the registry
 *
 * Fetches all registered trusted issuers from the subgraph, ordered by address.
 * Each issuer includes their assigned claim topics that they are authorized to verify.
 *
 * @returns Array of trusted issuers with their claim topic assignments
 */
export const trustedIssuerList = systemRouter.system.trustedIssuers.list
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context, errors }): Promise<TrustedIssuerListOutput> => {
    const { system, theGraphClient } = context;

    // Get the trusted issuers registry address from the system configuration
    const registryAddress = system?.trustedIssuersRegistry;

    if (!registryAddress) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System trusted issuers registry not found",
      });
    }

    // Query the subgraph for all trusted issuers
    const { trustedIssuers } = await theGraphClient.query(
      TRUSTED_ISSUERS_QUERY,
      {
        input: {
          registryAddress,
        },
        output: TrustedIssuerListResponseSchema,
      }
    );

    // Return the validated trusted issuers
    return TrustedIssuerListOutputSchema.parse(trustedIssuers);
  });
