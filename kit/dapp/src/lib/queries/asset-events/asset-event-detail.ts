import { tryAssetDetail } from "@/lib/queries/asset-detail";
import {
  type AssetEventDetail,
  AssetEventDetailSchema,
  type AssetEventValue,
  AssetEventValueSchema,
} from "@/lib/queries/asset-events/asset-events-schema";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { formatNumber } from "@/lib/utils/number";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import { getLocale } from "next-intl/server";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";

const AssetEventDetail = theGraphGraphqlKit(
  `
  query AssetEventDetail($id: ID!) {
    activityLogEntry(id: $id) {
      blockNumber
      blockTimestamp
      emitter {
        id
      }
      eventName
      sender {
        id
      }
      transactionHash
      txIndex
      values {
        name
        value
      }
    }
  }
`
);

/**
 * Props interface for asset events list components
 */
export interface AssetEventDetailProps {
  id: string;
}

const fetchAssetEventDetail = cache(async (id: string) => {
  "use cache";
  cacheTag("asset");

  const event = await theGraphClientKit.request(
    AssetEventDetail,
    {
      id,
    },
    {
      "X-GraphQL-Operation-Name": "AssetEventDetail",
      "X-GraphQL-Operation-Type": "query",
    }
  );

  return event.activityLogEntry;
});

/**
 * Formats event values based on event name and parameter index
 *
 * @param eventName - The name of the event
 * @param values - Array of event values
 * @param emitterId - The address of the event emitter
 * @returns The formatted event values
 */
async function formatEventValues(event: AssetEventDetail) {
  const { eventName, values, emitter } = event;
  const locale = await getLocale();

  try {
    for (const [index, current] of values.entries()) {
      const formatted: AssetEventValue = {
        ...current,
        formattedValue: undefined,
      };
      const { name, value } = current;

      switch (eventName) {
        case "Mint":
        case "Burn":
        case "Transfer":
          if (name === "amount" || name === "value" || index === 2) {
            const assetDetail = await tryAssetDetail(emitter.id);
            if (assetDetail?.decimals) {
              formatted.formattedValue = formatNumber(value, {
                decimals: assetDetail.decimals,
                locale,
                token: assetDetail.symbol,
                adjustDecimals: true,
              });
            }
          }
          break;
      }

      values[index] = formatted;
    }
  } catch (error) {
    console.error("Error formatting event values:", error);
  }

  return safeParse(t.Array(AssetEventValueSchema), values);
}

/**
 * Fetches and processes asset event data
 *
 * @param params - Object containing optional filters and limits
 * @returns Array of normalized asset events
 */
export const getAssetEventDetail = withTracing(
  "queries",
  "getAssetEventDetail",
  cache(async ({ id }: AssetEventDetailProps) => {
    const event = await fetchAssetEventDetail(id);

    const parsedEvent = safeParse(AssetEventDetailSchema, event);
    parsedEvent.values = await formatEventValues(parsedEvent);

    return parsedEvent;
  })
);
