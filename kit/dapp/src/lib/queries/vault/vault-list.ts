import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { VaultListFragment } from "./vault-fragment";
import { VaultListSchema } from "./vault-schema";

/**
 * GraphQL query to fetch XvPSettlement list from The Graph
 */
// const VaultList = theGraphGraphqlKit(
//   `
//   query VaultList($first: Int, $skip: Int) {
//     vaults(first: $first, skip: $skip) {
//       ...VaultListFragment
//     }
//   }
// `,
//   [VaultListFragment]
// );

export const getVaultList = withTracing("queries", "getVaultList", async () => {
  "use cache";
  cacheTag("trades");

  // return await fetchAllTheGraphPages(async (first, skip) => {
  //   const result = await theGraphClientKit.request(VaultList, {
  //     first,
  //     skip,
  //   });
  //   return safeParse(t.Array(VaultListSchema), result.vaults);
  // });

  // NOTE: HARDCODED SO IT STILL COMPILES
  return [];
});

export type VaultListItem = Awaited<ReturnType<typeof getVaultList>>[number];
