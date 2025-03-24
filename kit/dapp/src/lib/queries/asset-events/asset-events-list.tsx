import { fetchAllTheGraphPages } from "@/lib/pagination";
import { AssetEventFragment } from "@/lib/queries/asset-events/asset-events-fragments";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { formatDate } from "@/lib/utils/date";
import { safeParse } from "@/lib/utils/typebox";
import { getLocale, getTranslations } from "next-intl/server";
import { cache } from "react";
import type { Address } from "viem";
import {
  ApprovalEventFragment,
  AssetCreatedEventFragment,
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
  UnderlyingAssetTopUpEventFragment,
  UnderlyingAssetWithdrawnEventFragment,
  UnpausedEventFragment,
  UserAllowedEventFragment,
  UserBlockedEventFragment,
  UserDisallowedEventFragment,
  UserUnblockedEventFragment,
} from "./asset-events-fragments";
import {
  ApprovalEventSchema,
  AssetCreatedEventSchema,
  BondMaturedEventSchema,
  BondRedeemedEventSchema,
  BurnEventSchema,
  CollateralUpdatedEventSchema,
  ManagementFeeCollectedEventSchema,
  MintEventSchema,
  PausedEventSchema,
  PerformanceFeeCollectedEventSchema,
  RoleAdminChangedEventSchema,
  RoleGrantedEventSchema,
  RoleRevokedEventSchema,
  TokenWithdrawnEventSchema,
  TokensFrozenEventSchema,
  TransferEventSchema,
  UnderlyingAssetTopUpEventSchema,
  UnderlyingAssetWithdrawnEventSchema,
  UnpausedEventSchema,
  UserAllowedEventSchema,
  UserBlockedEventSchema,
  UserDisallowedEventSchema,
  UserUnblockedEventSchema,
  type NormalizedEventsListItem,
} from "./asset-events-schema";

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
    ...UserAllowedEventFragment
    ...UserDisallowedEventFragment
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
    UserAllowedEventFragment,
    UserDisallowedEventFragment,
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
        let validatedEvent = null;
        console.log(event);
        try {
          switch (eventName) {
            case "AssetCreatedEvent":
              validatedEvent = {
                ...safeParse(AssetCreatedEventSchema, event),
                prettyName: t("AssetCreatedEvent"),
              };
              break;
            case "ApprovalEvent":
              validatedEvent = {
                ...safeParse(ApprovalEventSchema, event),
                prettyName: t("ApprovalEvent"),
              };
              break;
            case "BondMaturedEvent":
              validatedEvent = {
                ...safeParse(BondMaturedEventSchema, event),
                prettyName: t("BondMaturedEvent"),
              };
              break;
            case "BondRedeemedEvent":
              validatedEvent = {
                ...safeParse(BondRedeemedEventSchema, event),
                prettyName: t("BondRedeemedEvent"),
              };
              break;
            case "BurnEvent":
              validatedEvent = {
                ...safeParse(BurnEventSchema, event),
                prettyName: t("BurnEvent"),
              };
              break;
            case "CollateralUpdatedEvent":
              validatedEvent = {
                ...safeParse(CollateralUpdatedEventSchema, event),
                prettyName: t("CollateralUpdatedEvent"),
              };
              break;
            case "ManagementFeeCollectedEvent":
              validatedEvent = {
                ...safeParse(ManagementFeeCollectedEventSchema, event),
                prettyName: t("ManagementFeeCollectedEvent"),
              };
              break;
            case "MintEvent":
              validatedEvent = {
                ...safeParse(MintEventSchema, event),
                prettyName: t("MintEvent"),
              };
              break;
            case "PausedEvent":
              validatedEvent = {
                ...safeParse(PausedEventSchema, event),
                prettyName: t("PausedEvent"),
              };
              break;
            case "PerformanceFeeCollectedEvent":
              validatedEvent = {
                ...safeParse(PerformanceFeeCollectedEventSchema, event),
                prettyName: t("PerformanceFeeCollectedEvent"),
              };
              break;
            case "RoleAdminChangedEvent":
              validatedEvent = {
                ...safeParse(RoleAdminChangedEventSchema, event),
                prettyName: t("RoleAdminChangedEvent"),
              };
              break;
            case "RoleGrantedEvent":
              validatedEvent = {
                ...safeParse(RoleGrantedEventSchema, event),
                prettyName: t("RoleGrantedEvent"),
              };
              break;
            case "RoleRevokedEvent":
              validatedEvent = {
                ...safeParse(RoleRevokedEventSchema, event),
                prettyName: t("RoleRevokedEvent"),
              };
              break;
            case "TokenWithdrawnEvent":
              validatedEvent = {
                ...safeParse(TokenWithdrawnEventSchema, event),
                prettyName: t("TokenWithdrawnEvent"),
              };
              break;
            case "TokensFrozenEvent":
              validatedEvent = {
                ...safeParse(TokensFrozenEventSchema, event),
                prettyName: t("TokensFrozenEvent"),
              };
              break;
            case "TransferEvent":
              validatedEvent = {
                ...safeParse(TransferEventSchema, event),
                prettyName: t("TransferEvent"),
              };
              break;
            case "UnpausedEvent":
              validatedEvent = {
                ...safeParse(UnpausedEventSchema, event),
                prettyName: t("UnpausedEvent"),
              };
              break;
            case "UserBlockedEvent":
              validatedEvent = {
                ...safeParse(UserBlockedEventSchema, event),
                prettyName: t("UserBlockedEvent"),
              };
              break;
            case "UserUnblockedEvent":
              validatedEvent = {
                ...safeParse(UserUnblockedEventSchema, event),
                prettyName: t("UserUnblockedEvent"),
              };
              break;
            case "UserAllowedEvent":
              validatedEvent = {
                ...safeParse(UserAllowedEventSchema, event),
                prettyName: t("UserAllowedEvent"),
              };
              break;
            case "UserDisallowedEvent":
              validatedEvent = {
                ...safeParse(UserDisallowedEventSchema, event),
                prettyName: t("UserDisallowedEvent"),
              };
              break;
            case "UnderlyingAssetTopUpEvent":
              validatedEvent = {
                ...safeParse(UnderlyingAssetTopUpEventSchema, event),
                prettyName: t("UnderlyingAssetTopUpEvent"),
              };
              break;
            case "UnderlyingAssetWithdrawnEvent":
              validatedEvent = {
                ...safeParse(UnderlyingAssetWithdrawnEventSchema, event),
                prettyName: t("UnderlyingAssetWithdrawnEvent"),
              };
              break;
            default:
              console.error(`Unknown event type: ${eventName}`);
              validatedEvent = null;
          }
        } catch (error) {
          console.error(`Error validating ${eventName} event:`, error);
          validatedEvent = null;
        }

        return validatedEvent;
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
