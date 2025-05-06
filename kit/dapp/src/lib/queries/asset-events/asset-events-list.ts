import "server-only";

import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t as tTypebox } from "@/lib/utils/typebox";
import type { VariablesOf } from "gql.tada";
import { getTranslations } from "next-intl/server";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { Address } from "viem";
import { AssetEventListSchema } from "./asset-events-schema";

/**
 * GraphQL query to fetch asset events
 */
const AssetEventsList = theGraphGraphqlKit(
  `
  query AssetEventsList($first: Int, $skip: Int, $where: ActivityLogEntry_filter) {
    activityLogEntries(
      first: $first
      skip: $skip
      orderBy: blockNumber
      orderDirection: desc
      where: $where
    ) {
      id
      blockTimestamp
      eventName
      emitter {
        id
      }
      sender {
        id
      }
    }
  }
`
);

/**
 * Props interface for asset events list components
 */
export interface AssetEventsListProps {
  /** Optional asset address to filter by */
  asset?: Address;
  /** Optional sender address to filter by */
  sender?: Address;
  /** Optional limit to restrict total items fetched */
  limit?: number;
}

const fetchAssetEventsList = cache(
  async (
    asset: Address | undefined,
    sender: Address | undefined,
    limit: number | undefined
  ) => {
    "use cache";
    cacheTag("asset");
    const where: VariablesOf<typeof AssetEventsList>["where"] = {};

    if (asset) {
      where.emitter = asset.toLowerCase();
    }

    if (sender) {
      where.sender = sender.toLowerCase();
    }

    const events = await fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKit.request(
        AssetEventsList,
        {
          first,
          skip,
          where,
        },
        {
          "X-GraphQL-Operation-Name": "AssetEventsList",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      const events = result.activityLogEntries || [];

      // If we have a limit, check if we should stop
      if (limit && skip + events.length >= limit) {
        return events.slice(0, limit - skip);
      }

      return events;
    }, limit);

    return events;
  }
);

/**
 * Fetches and processes asset event data
 *
 * @param params - Object containing optional filters and limits
 * @returns Array of normalized asset events
 */
export const getAssetEventsList = withTracing(
  "queries",
  "getAssetEventsList",
  cache(async ({ asset, sender, limit }: AssetEventsListProps) => {
    const events = await fetchAssetEventsList(asset, sender, limit);

    const t = await getTranslations("asset-events");

    // Validate and transform events
    const validatedEvents = safeParse(
      tTypebox.Array(AssetEventListSchema),
      events
    );

    return validatedEvents.map((validatedEvent) => {
      return {
        ...validatedEvent,
        eventName: t(validatedEvent.eventName as any),
      };
    });
  })
);
