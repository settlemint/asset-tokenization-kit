import { assetConfig } from '@/lib/config/assets';
import { fetchAllTheGraphPages } from '@/lib/pagination';
import { AssetEventFragment } from '@/lib/queries/asset-events/asset-events-fragments';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { formatDate } from '@/lib/utils/date';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

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
  type NormalizedEventsListItem,
} from './asset-events-fragments';

/**
 * GraphQL query to fetch asset events
 */
const AssetEventsList = theGraphGraphqlStarterkits(
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
export async function getAssetEventsList({
  asset,
  sender,
  limit,
}: AssetEventsListProps) {
  try {
    const where: Record<string, unknown> = {};

    if (asset) {
      where.emitter = asset.toLowerCase();
    }

    if (sender) {
      where.sender = sender.toLowerCase();
    }

    const events = await fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(AssetEventsList, {
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

    // Validate and transform events
    const validatedEvents = events
      .map((event) => {
        const eventName = event.__typename;

        switch (eventName) {
          case 'AssetCreatedEvent':
            return safeParseWithLogging(
              AssetCreatedEventFragmentSchema,
              event,
              'AssetCreatedEvent'
            );
          case 'ApprovalEvent':
            return safeParseWithLogging(
              ApprovalEventFragmentSchema,
              event,
              'ApprovalEvent'
            );
          case 'BondMaturedEvent':
            return safeParseWithLogging(
              BondMaturedEventFragmentSchema,
              event,
              'BondMaturedEvent'
            );
          case 'BondRedeemedEvent':
            return safeParseWithLogging(
              BondRedeemedEventFragmentSchema,
              event,
              'BondRedeemedEvent'
            );
          case 'BurnEvent':
            return safeParseWithLogging(
              BurnEventFragmentSchema,
              event,
              'BurnEvent'
            );
          case 'CollateralUpdatedEvent':
            return safeParseWithLogging(
              CollateralUpdatedEventFragmentSchema,
              event,
              'CollateralUpdatedEvent'
            );
          case 'ManagementFeeCollectedEvent':
            return safeParseWithLogging(
              ManagementFeeCollectedEventFragmentSchema,
              event,
              'ManagementFeeCollectedEvent'
            );
          case 'MintEvent':
            return safeParseWithLogging(
              MintEventFragmentSchema,
              event,
              'MintEvent'
            );
          case 'PausedEvent':
            return safeParseWithLogging(
              PausedEventFragmentSchema,
              event,
              'PausedEvent'
            );
          case 'PerformanceFeeCollectedEvent':
            return safeParseWithLogging(
              PerformanceFeeCollectedEventFragmentSchema,
              event,
              'PerformanceFeeCollectedEvent'
            );
          case 'RoleAdminChangedEvent':
            return safeParseWithLogging(
              RoleAdminChangedEventFragmentSchema,
              event,
              'RoleAdminChangedEvent'
            );
          case 'RoleGrantedEvent':
            return safeParseWithLogging(
              RoleGrantedEventFragmentSchema,
              event,
              'RoleGrantedEvent'
            );
          case 'RoleRevokedEvent':
            return safeParseWithLogging(
              RoleRevokedEventFragmentSchema,
              event,
              'RoleRevokedEvent'
            );
          case 'TokenWithdrawnEvent':
            return safeParseWithLogging(
              TokenWithdrawnEventFragmentSchema,
              event,
              'TokenWithdrawnEvent'
            );
          case 'TokensFrozenEvent':
            return safeParseWithLogging(
              TokensFrozenEventFragmentSchema,
              event,
              'TokensFrozenEvent'
            );
          case 'TransferEvent':
            return safeParseWithLogging(
              TransferEventFragmentSchema,
              event,
              'TransferEvent'
            );
          case 'UnpausedEvent':
            return safeParseWithLogging(
              UnpausedEventFragmentSchema,
              event,
              'UnpausedEvent'
            );
          case 'UserBlockedEvent':
            return safeParseWithLogging(
              UserBlockedEventFragmentSchema,
              event,
              'UserBlockedEvent'
            );
          case 'UserUnblockedEvent':
            return safeParseWithLogging(
              UserUnblockedEventFragmentSchema,
              event,
              'UserUnblockedEvent'
            );
          case 'UnderlyingAssetTopUpEvent':
            return safeParseWithLogging(
              UnderlyingAssetTopUpEventFragmentSchema,
              event,
              'UnderlyingAssetTopUpEvent'
            );
          case 'UnderlyingAssetWithdrawnEvent':
            return safeParseWithLogging(
              UnderlyingAssetWithdrawnEventFragmentSchema,
              event,
              'UnderlyingAssetWithdrawnEvent'
            );
          default:
            console.warn(`Unknown event type`);
            return null;
        }
      })
      .filter(Boolean);

    return validatedEvents.map((validatedEvent: any) => {
      return {
        event: validatedEvent.__typename,
        timestamp: formatDate(validatedEvent.timestamp),
        asset:
          validatedEvent.emitter.id in assetConfig
            ? assetConfig[validatedEvent.emitter.id as keyof typeof assetConfig]
                ?.name || validatedEvent.emitter.id
            : validatedEvent.emitter.id,
        sender: validatedEvent.sender?.id || 'System',
        details: validatedEvent,
        transactionHash: validatedEvent.id.split('-')[0],
      } as NormalizedEventsListItem;
    });
  } catch (error) {
    console.error('Error fetching asset events:', error);
    return [];
  }
}

/**
 * Generates a consistent query key for asset events list queries
 *
 * @param params - Object containing optional filters and limits
 * @returns Array representing the query key for React Query
 */
const getQueryKey = ({ asset, sender, limit }: AssetEventsListProps) =>
  ['asset', 'events', asset ?? 'all', sender ?? 'all', limit] as const;

/**
 * React Query hook for fetching asset events lists
 *
 * @param params - Object containing optional filters and limits
 * @returns Query result with asset events and query key
 */
export function useAssetEventsList({
  asset,
  sender,
  limit,
}: AssetEventsListProps) {
  const queryKey = getQueryKey({ asset, sender, limit });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getAssetEventsList({ asset, sender, limit }),
  });

  return {
    ...result,
    queryKey,
  };
}
