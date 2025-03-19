import { fetchAllTheGraphPages } from "@/lib/pagination";
import { AssetEventFragment } from "@/lib/queries/asset-events/asset-events-fragments";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { formatDate } from "@/lib/utils/date";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { getLocale, getTranslations } from "next-intl/server";
import { cache } from "react";
import type { Address } from "viem";
import {
  ApprovalEventFragment,
  ApprovalEventFragmentSchema,
  AssetCreatedEventFragment,
  AssetCreatedEventFragmentSchema,
  BondMaturedEventFragment,
  BondMaturedEventFragmentSchema,
  BondRedeemedEventFragment,
  BondRedeemedEventFragmentSchema,
  BurnEventFragment,
  BurnEventFragmentSchema,
  CollateralUpdatedEventFragment,
  CollateralUpdatedEventFragmentSchema,
  ManagementFeeCollectedEventFragment,
  ManagementFeeCollectedEventFragmentSchema,
  MintEventFragment,
  MintEventFragmentSchema,
  type NormalizedEventsListItem,
  PausedEventFragment,
  PausedEventFragmentSchema,
  PerformanceFeeCollectedEventFragment,
  PerformanceFeeCollectedEventFragmentSchema,
  RoleAdminChangedEventFragment,
  RoleAdminChangedEventFragmentSchema,
  RoleGrantedEventFragment,
  RoleGrantedEventFragmentSchema,
  RoleRevokedEventFragment,
  RoleRevokedEventFragmentSchema,
  TokenWithdrawnEventFragment,
  TokenWithdrawnEventFragmentSchema,
  TokensFrozenEventFragment,
  TokensFrozenEventFragmentSchema,
  TransferEventFragment,
  TransferEventFragmentSchema,
  UnderlyingAssetTopUpEventFragment,
  UnderlyingAssetTopUpEventFragmentSchema,
  UnderlyingAssetWithdrawnEventFragment,
  UnderlyingAssetWithdrawnEventFragmentSchema,
  UnpausedEventFragment,
  UnpausedEventFragmentSchema,
  UserBlockedEventFragment,
  UserBlockedEventFragmentSchema,
  UserUnblockedEventFragment,
  UserUnblockedEventFragmentSchema,
} from "./asset-events-fragments";

/**
 * GraphQL query to fetch asset events
 */
const AssetEventsList = theGraphGraphqlKit(
  `
query AssetEventsList($first: Int, $skip: Int, $where: AssetEvent_filter) {
  assetEvents(
    orderBy: timestamp,
    orderDirection: desc,
    first: $first,
    skip: $skip,
    where: $where
  ) {
    ...AssetEventFragment
    ...AssetCreatedEventFragment
    ...ApprovalEventFragment
    ...BondMaturedEventFragment
    ...BondRedeemedEventFragment
    ...BurnEventFragment
    ...CollateralUpdatedEventFragment
    ...ManagementFeeCollectedEventFragment
    ...MintEventFragment
    ...PausedEventFragment
    ...PerformanceFeeCollectedEventFragment
    ...RoleAdminChangedEventFragment
    ...RoleGrantedEventFragment
    ...RoleRevokedEventFragment
    ...TokenWithdrawnEventFragment
    ...TokensFrozenEventFragment
    ...TransferEventFragment
    ...UnpausedEventFragment
    ...UserBlockedEventFragment
    ...UserUnblockedEventFragment
    ...UnderlyingAssetTopUpEventFragment
    ...UnderlyingAssetWithdrawnEventFragment
  }
}
`,
  [
    AssetEventFragment,
    AssetCreatedEventFragment,
    ApprovalEventFragment,
    BondMaturedEventFragment,
    BondRedeemedEventFragment,
    BurnEventFragment,
    CollateralUpdatedEventFragment,
    ManagementFeeCollectedEventFragment,
    MintEventFragment,
    PausedEventFragment,
    PerformanceFeeCollectedEventFragment,
    RoleAdminChangedEventFragment,
    RoleGrantedEventFragment,
    RoleRevokedEventFragment,
    TokenWithdrawnEventFragment,
    TokensFrozenEventFragment,
    TransferEventFragment,
    UnpausedEventFragment,
    UserBlockedEventFragment,
    UserUnblockedEventFragment,
    UnderlyingAssetTopUpEventFragment,
    UnderlyingAssetWithdrawnEventFragment,
  ]
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

/**
 * Fetches and processes asset event data
 *
 * @param params - Object containing optional filters and limits
 * @returns Array of normalized asset events
 */
export const getAssetEventsList = cache(
  async ({ asset, sender, limit }: AssetEventsListProps) => {
    const where: Record<string, unknown> = {};

    if (asset) {
      where.emitter = asset.toLowerCase();
    }

    if (sender) {
      where.sender = sender.toLowerCase();
    }

    const events = await fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKit.request(AssetEventsList, {
        first,
        skip,
        where,
      });

      const events = result.assetEvents || [];

      // If we have a limit, check if we should stop
      if (limit && skip + events.length >= limit) {
        return events.slice(0, limit - skip);
      }

      return events;
    }, limit);

    const locale = await getLocale();
    const t = await getTranslations("asset-events");

    // Validate and transform events
    const validatedEvents = events
      .map((event) => {
        const eventName = event.__typename;

        switch (eventName) {
          case "AssetCreatedEvent":
            return {
              ...safeParseWithLogging(
                AssetCreatedEventFragmentSchema,
                event,
                "AssetCreatedEvent"
              ),
              prettyName: t("AssetCreatedEvent"),
            };
          case "ApprovalEvent":
            return {
              ...safeParseWithLogging(
                ApprovalEventFragmentSchema,
                event,
                "ApprovalEvent"
              ),
              prettyName: t("ApprovalEvent"),
            };
          case "BondMaturedEvent":
            return {
              ...safeParseWithLogging(
                BondMaturedEventFragmentSchema,
                event,
                "BondMaturedEvent"
              ),
              prettyName: t("BondMaturedEvent"),
            };
          case "BondRedeemedEvent":
            return {
              ...safeParseWithLogging(
                BondRedeemedEventFragmentSchema,
                event,
                "BondRedeemedEvent"
              ),
              prettyName: t("BondRedeemedEvent"),
            };
          case "BurnEvent":
            return {
              ...safeParseWithLogging(
                BurnEventFragmentSchema,
                event,
                "BurnEvent"
              ),
              prettyName: t("BurnEvent"),
            };
          case "CollateralUpdatedEvent":
            return {
              ...safeParseWithLogging(
                CollateralUpdatedEventFragmentSchema,
                event,
                "CollateralUpdatedEvent"
              ),
              prettyName: t("CollateralUpdatedEvent"),
            };
          case "ManagementFeeCollectedEvent":
            return {
              ...safeParseWithLogging(
                ManagementFeeCollectedEventFragmentSchema,
                event,
                "ManagementFeeCollectedEvent"
              ),
              prettyName: t("ManagementFeeCollectedEvent"),
            };
          case "MintEvent":
            return {
              ...safeParseWithLogging(
                MintEventFragmentSchema,
                event,
                "MintEvent"
              ),
              prettyName: t("MintEvent"),
            };
          case "PausedEvent":
            return {
              ...safeParseWithLogging(
                PausedEventFragmentSchema,
                event,
                "PausedEvent"
              ),
              prettyName: t("PausedEvent"),
            };
          case "PerformanceFeeCollectedEvent":
            return {
              ...safeParseWithLogging(
                PerformanceFeeCollectedEventFragmentSchema,
                event,
                "PerformanceFeeCollectedEvent"
              ),
              prettyName: t("PerformanceFeeCollectedEvent"),
            };
          case "RoleAdminChangedEvent":
            return {
              ...safeParseWithLogging(
                RoleAdminChangedEventFragmentSchema,
                event,
                "RoleAdminChangedEvent"
              ),
              prettyName: t("RoleAdminChangedEvent"),
            };
          case "RoleGrantedEvent":
            return {
              ...safeParseWithLogging(
                RoleGrantedEventFragmentSchema,
                event,
                "RoleGrantedEvent"
              ),
              prettyName: t("RoleGrantedEvent"),
            };
          case "RoleRevokedEvent":
            return {
              ...safeParseWithLogging(
                RoleRevokedEventFragmentSchema,
                event,
                "RoleRevokedEvent"
              ),
              prettyName: t("RoleRevokedEvent"),
            };
          case "TokenWithdrawnEvent":
            return {
              ...safeParseWithLogging(
                TokenWithdrawnEventFragmentSchema,
                event,
                "TokenWithdrawnEvent"
              ),
              prettyName: t("TokenWithdrawnEvent"),
            };
          case "TokensFrozenEvent":
            return {
              ...safeParseWithLogging(
                TokensFrozenEventFragmentSchema,
                event,
                "TokensFrozenEvent"
              ),
              prettyName: t("TokensFrozenEvent"),
            };
          case "TransferEvent":
            return {
              ...safeParseWithLogging(
                TransferEventFragmentSchema,
                event,
                "TransferEvent"
              ),
              prettyName: t("TransferEvent"),
            };
          case "UnpausedEvent":
            return {
              ...safeParseWithLogging(
                UnpausedEventFragmentSchema,
                event,
                "UnpausedEvent"
              ),
              prettyName: t("UnpausedEvent"),
            };
          case "UserBlockedEvent":
            return {
              ...safeParseWithLogging(
                UserBlockedEventFragmentSchema,
                event,
                "UserBlockedEvent"
              ),
              prettyName: t("UserBlockedEvent"),
            };
          case "UserUnblockedEvent":
            return {
              ...safeParseWithLogging(
                UserUnblockedEventFragmentSchema,
                event,
                "UserUnblockedEvent"
              ),
              prettyName: t("UserUnblockedEvent"),
            };
          case "UnderlyingAssetTopUpEvent":
            return {
              ...safeParseWithLogging(
                UnderlyingAssetTopUpEventFragmentSchema,
                event,
                "UnderlyingAssetTopUpEvent"
              ),
              prettyName: t("UnderlyingAssetTopUpEvent"),
            };
          case "UnderlyingAssetWithdrawnEvent":
            return {
              ...safeParseWithLogging(
                UnderlyingAssetWithdrawnEventFragmentSchema,
                event,
                "UnderlyingAssetWithdrawnEvent"
              ),
              prettyName: t("UnderlyingAssetWithdrawnEvent"),
            };
          default:
            return null;
        }
      })
      .filter((event) => event !== null);

    return validatedEvents.map((validatedEvent): NormalizedEventsListItem => {
      return {
        event: validatedEvent.prettyName,
        timestamp: formatDate(validatedEvent.timestamp, { locale }),
        asset: validatedEvent.emitter.id,
        assetType: validatedEvent.assetType,
        sender: validatedEvent.sender?.id || "System",
        details: validatedEvent,
        transactionHash: validatedEvent.id.split("-")[0],
      };
    });
  }
);
