import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
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
      deployedInTransaction
      claims {
        id
        revoked
      }
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
        deployedInTransaction: z.string().nullish(),
        claims: z
          .array(
            z.object({
              id: z.string(),
              revoked: z.boolean(),
            })
          )
          .default([]),
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

export const identityList = systemRouter.system.identity.list
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.identityList,
      getAccessControl: ({ context }) =>
        context.system?.systemAccessManager?.accessControl,
    })
  )
  .handler(async ({ input, context }) => {
    const parsedInput = IdentityListInputSchema.parse(input);
    const { limit, offset, orderDirection, orderBy, filters } = parsedInput;
    const { system } = context;

    const first = limit ?? 50;
    const skip = offset;
    const graphOrderBy = resolveOrderBy(orderBy);
    const graphOrderDirection: "asc" | "desc" =
      orderDirection === "desc" ? "desc" : "asc";

    type IdentityListWhere = VariablesOf<typeof IDENTITY_LIST_QUERY>["where"];
    const whereFilters: IdentityListWhere = {
      identityFactory: system.identityFactory.id,
    };

    if (filters?.accountId) {
      whereFilters.account = filters.accountId.toLowerCase();
    }
    if (typeof filters?.isContract === "boolean") {
      whereFilters.isContract = filters.isContract;
    }

    const variables: VariablesOf<typeof IDENTITY_LIST_QUERY> = {
      first,
      skip,
      orderBy: graphOrderBy,
      orderDirection: graphOrderDirection,
      where: Object.keys(whereFilters).length > 0 ? whereFilters : undefined,
    };

    const response = await context.theGraphClient?.query(IDENTITY_LIST_QUERY, {
      input: variables,
      output: IdentityListGraphSchema,
    });

    const identities = response?.identities ?? [];

    const items = identities.map((identity) => {
      const claims = identity.claims ?? [];
      const revokedClaimsCount = claims.filter((claim) => claim.revoked).length;
      const activeClaimsCount = claims.length - revokedClaimsCount;
      const account =
        identity.account && !identity.account.isContract
          ? { id: identity.account.id }
          : null;
      const contract =
        identity.account && identity.account.isContract
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
        deployedInTransaction: identity.deployedInTransaction ?? "",
      };
    });

    return IdentityListOutputSchema.parse({
      items,
      total: response?.total?.length ?? 0,
      limit,
      offset,
    });
  });

export default identityList;
