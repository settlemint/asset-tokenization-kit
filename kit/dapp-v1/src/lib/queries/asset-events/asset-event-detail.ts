import { AssetEventDetailSchema } from "@/lib/queries/asset-events/asset-events-schema";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";

// const AssetEventDetail = theGraphGraphqlKit(
//   `
//   query AssetEventDetail($id: ID!) {
//     activityLogEntry(id: $id) {
//       blockNumber
//       blockTimestamp
//       emitter {
//         id
//       }
//       eventName
//       sender {
//         id
//       }
//       transactionHash
//       txIndex
//       values {
//         name
//         value
//       }
//     }
//   }
// `
// );

/**
 * Props interface for asset events list components
 */
export interface AssetEventDetailProps {
  id: string;
}

const fetchAssetEventDetail = cache(async (id: string) => {
  "use cache";
  cacheTag("asset");

  //       // const event = await theGraphClientKit.request(
  //       //     AssetEventDetail,
  //       //     {
  //       //       id,
  //       //     },
  //       //     {
  //       //       "X-GraphQL-Operation-Name": "AssetEventDetail",
  //       //       "X-GraphQL-Operation-Type": "query",
  //       //     }
  //       //   );

  return {
    blockNumber: 123,
    blockTimestamp: 123,
    emitter: { id: "0x1234567890123456789012345678901234567890" },
    eventName: "Event Name",
    sender: { id: "0x1234567890123456789012345678901234567890" },
  };
});

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

    return safeParse(AssetEventDetailSchema, event);
  })
);
