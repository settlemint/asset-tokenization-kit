import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import {
  IdentityListInputSchema,
  IdentityListOutputSchema,
} from "@/orpc/routes/system/identity/routes/identity.list.schema";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import type { VariablesOf } from "@settlemint/sdk-thegraph";
import { z } from "zod";

const IDENTITY_LIST_QUERY = theGraphGraphql(`
  query IdentityList(
    $first: Int!
    $skip: Int!
    $orderBy: Identity_orderBy!
    $orderDirection: OrderDirection!
    $where: Identity_filter
  ) {
    identities(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      isContract
      account {
        id
        isContract
        contractName
      }
      claims {
        id
        name
        revoked
      }
      registryStorage {
        id
      }
      deployedInTransaction
    }
    total: identities(where: $where) @fetchAll {
      id
    }
  }
`);

const IdentityListGraphSchema = z.object({
  identities: z
    .array(
      z.object({
        id: z.string(),
        isContract: z.boolean().optional(),
        account: z
          .object({
            id: z.string(),
            isContract: z.boolean(),
            contractName: z.string().nullish(),
          })
          .nullish(),
        claims: z
          .array(
            z.object({
              id: z.string(),
              name: z.string().nullish(),
              revoked: z.boolean(),
            })
          )
          .nullish(),
        registryStorage: z.object({ id: z.string() }).nullish(),
        deployedInTransaction: z.string().nullish(),
      })
    )
    .default([]),
  total: z.array(z.object({ id: z.string() })).default([]),
});

type IdentityOrderField = "id" | "deployedInTransaction";

const resolveOrderBy = (orderBy: string | undefined): IdentityOrderField => {
  if (orderBy === "deployedInTransaction") {
    return "deployedInTransaction";
  }
  if (orderBy === "createdAt") {
    return "deployedInTransaction";
  }
  return "id";
};

export const identityList = authRouter.system.identity.list
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.claimList,
      getAccessControl: ({ context }) =>
        context.system?.systemAccessManager?.accessControl,
    })
  )
  .handler(async ({ input, context }) => {
    const parsedInput = IdentityListInputSchema.parse(input);
    const { limit, offset, orderDirection, orderBy, filters } = parsedInput;

    const first = limit ?? 1000;
    const skip = offset;
    const graphOrderBy = resolveOrderBy(orderBy);
    const graphOrderDirection: "asc" | "desc" =
      orderDirection === "desc" ? "desc" : "asc";

    const whereFilters: Record<string, unknown> = {};
    if (filters?.accountId) {
      whereFilters.account = filters.accountId.toLowerCase();
    }
    if (typeof filters?.isContract === "boolean") {
      whereFilters.isContract = filters.isContract;
    }
    if (filters?.registryStorageId) {
      whereFilters.registryStorage = filters.registryStorageId.toLowerCase();
    }

    type IdentityListWhere = VariablesOf<typeof IDENTITY_LIST_QUERY>["where"];

    const variables: VariablesOf<typeof IDENTITY_LIST_QUERY> = {
      first,
      skip,
      orderBy: graphOrderBy,
      orderDirection: graphOrderDirection,
      where:
        Object.keys(whereFilters).length > 0
          ? (whereFilters as IdentityListWhere)
          : undefined,
    };

    const response = await context.theGraphClient.query(IDENTITY_LIST_QUERY, {
      input: variables,
      output: IdentityListGraphSchema,
    });

    const identities = response.identities ?? [];
    const items = identities.map((identity) => {
      const claims = identity.claims ?? [];
      const revokedClaimsCount = claims.filter((claim) => claim.revoked).length;
      const activeClaimsCount = claims.length - revokedClaimsCount;
      const account =
        identity.account && identity.account.isContract === false
          ? { id: identity.account.id }
          : null;
      const contract =
        identity.account && identity.account.isContract !== false
          ? {
              id: identity.account.id,
              contractName: identity.account.contractName ?? undefined,
            }
          : null;

      return {
        id: identity.id,
        account,
        contract,
        claimsCount: claims.length,
        activeClaimsCount,
        revokedClaimsCount,
        registryStorageId: identity.registryStorage?.id,
        deployedInTransaction: identity.deployedInTransaction,
      };
    });

    return IdentityListOutputSchema.parse({
      items,
      total: response.total?.length ?? 0,
      limit,
      offset,
    });
  });

export default identityList;
