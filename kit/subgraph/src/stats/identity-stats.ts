import { Address } from "@graphprotocol/graph-ts";
import { IdentityStatsData, IdentityStatsState } from "../../generated/schema";
import { hasIdentityInSystem } from "../identity-factory/utils/identity-factory-utils";
import { hasRegisteredIdentity } from "../identity-registry-storage/utils/identity-registry-storage-utils";
import { fetchSystem } from "../system/fetch/system";
import { fetchAccountSystemStatsStateForSystem } from "./account-stats";

/**
 * Track identity creation for statistical purposes
 * @param systemAddress - The address of the system
 * @param isContract - Whether the created identity is a contract
 */
export function trackIdentityCreated(
  accountAddress: Address,
  systemAddress: Address,
  isContract: boolean
): void {
  const state = fetchIdentityStatsState(systemAddress);

  const account = fetchAccountSystemStatsStateForSystem(
    accountAddress,
    systemAddress
  );

  // If the account is already an admin, the pending registration count should not be incremented since it will never be decremented again
  // Why? Because pending registration count is only decremented when the account is granted a role in the system for the first time
  if (!account.isAdmin) {
    incrementPendingIdentitiesCount(state, isContract);
  }

  incrementIdentitiesCreatedCount(state, isContract);
  state.save();

  // Create timeseries entry
  const data = createIdentityStatsData(state);
  data.save();
}

/**
 * Track identity registration for statistical purposes
 * @param systemAddress - The address of the system
 * @param isContract - Whether the registered identity is a contract
 */
export function trackIdentityRegistered(
  accountAddress: Address,
  systemAddress: Address,
  isContract: boolean
): void {
  const state = fetchIdentityStatsState(systemAddress);

  const account = fetchAccountSystemStatsStateForSystem(
    accountAddress,
    systemAddress
  );

  // If the account is an admin, the pending registration count was already decremented in the trackRoleGranted function
  // when the account was granted the admin role
  // So we don't need to decrement it again
  if (!account.isAdmin) {
    decrementPendingIdentitiesCount(state, isContract);
  }

  incrementActiveIdentitiesCount(state, isContract);
  state.save();

  // Create timeseries entry
  const data = createIdentityStatsData(state);
  data.save();
}

export function trackRoleGranted(
  accountAddress: Address,
  systemAddress: Address,
  isContract: boolean,
  isFirstRoleGrant: boolean
): void {
  // Do nothing, the pending registration count was already decremented when this user became an admin for the first time in this system
  if (!isFirstRoleGrant) {
    return;
  }
  const state = fetchIdentityStatsState(systemAddress);

  const accountHasRegisteredIdentity = hasRegisteredIdentity(
    accountAddress,
    systemAddress
  );

  if (!accountHasRegisteredIdentity) {
    const accountHasIdentityInSystem = hasIdentityInSystem(
      accountAddress,
      systemAddress
    );
    if (accountHasIdentityInSystem) {
      decrementPendingIdentitiesCount(state, isContract);
      state.save();
    }
  }

  // Create timeseries entry
  const data = createIdentityStatsData(state);
  data.save();
}

/**
 * Track identity removal for statistical purposes
 * @param systemAddress - The address of the system
 * @param isContract - Whether the removed identity is a contract
 */
export function trackIdentityRemoved(
  systemAddress: Address,
  isContract: boolean
): void {
  const state = fetchIdentityStatsState(systemAddress);

  decrementActiveIdentitiesCount(state, isContract);
  incrementRemovedIdentitiesCount(state, isContract);
  state.save();

  // Create timeseries entry
  const data = createIdentityStatsData(state);
  data.save();
}

/**
 * Fetch or create IdentityStatsState entity
 */
export function fetchIdentityStatsState(
  systemAddress: Address
): IdentityStatsState {
  let state = IdentityStatsState.load(systemAddress);

  if (!state) {
    const system = fetchSystem(systemAddress);
    state = new IdentityStatsState(systemAddress);
    state.system = system.id;
    state.pendingUserIdentitiesCount = 0;
    state.pendingContractIdentitiesCount = 0;
    state.userIdentitiesCreatedCount = 0;
    state.contractIdentitiesCreatedCount = 0;
    state.activeUserIdentitiesCount = 0;
    state.activeContractIdentitiesCount = 0;
    state.removedUserIdentitiesCount = 0;
    state.removedContractIdentitiesCount = 0;
    state.save();
  }

  return state;
}

/**
 * Create a new IdentityStatsData entity
 * @param state - The IdentityStatsState entity
 * @returns The new IdentityStatsData entity
 */
function createIdentityStatsData(state: IdentityStatsState): IdentityStatsData {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const identityStats = new IdentityStatsData(1);

  identityStats.system = state.system;
  identityStats.userIdentitiesCreatedCount = state.userIdentitiesCreatedCount;
  identityStats.contractIdentitiesCreatedCount =
    state.contractIdentitiesCreatedCount;
  identityStats.activeUserIdentitiesCount = state.activeUserIdentitiesCount;
  identityStats.activeContractIdentitiesCount =
    state.activeContractIdentitiesCount;
  identityStats.removedUserIdentitiesCount = state.removedUserIdentitiesCount;
  identityStats.removedContractIdentitiesCount =
    state.removedContractIdentitiesCount;
  identityStats.pendingUserIdentitiesCount = state.pendingUserIdentitiesCount;
  identityStats.pendingContractIdentitiesCount =
    state.pendingContractIdentitiesCount;

  return identityStats;
}

export function incrementPendingIdentitiesCount(
  state: IdentityStatsState,
  isContract: boolean
): void {
  if (isContract) {
    state.pendingContractIdentitiesCount =
      state.pendingContractIdentitiesCount + 1;
  } else {
    state.pendingUserIdentitiesCount = state.pendingUserIdentitiesCount + 1;
  }
}

export function decrementPendingIdentitiesCount(
  state: IdentityStatsState,
  isContract: boolean
): void {
  // Intentionally allows decrementing the count below 0
  // This should never happen, but it's better to track it than to let it go unnoticed
  if (isContract) {
    state.pendingContractIdentitiesCount =
      state.pendingContractIdentitiesCount - 1;
  } else {
    state.pendingUserIdentitiesCount = state.pendingUserIdentitiesCount - 1;
  }
}

export function incrementActiveIdentitiesCount(
  state: IdentityStatsState,
  isContract: boolean
): void {
  if (isContract) {
    state.activeContractIdentitiesCount =
      state.activeContractIdentitiesCount + 1;
  } else {
    state.activeUserIdentitiesCount = state.activeUserIdentitiesCount + 1;
  }
}

export function decrementActiveIdentitiesCount(
  state: IdentityStatsState,
  isContract: boolean
): void {
  if (isContract) {
    state.activeContractIdentitiesCount =
      state.activeContractIdentitiesCount - 1;
  } else {
    state.activeUserIdentitiesCount = state.activeUserIdentitiesCount - 1;
  }
}

export function incrementRemovedIdentitiesCount(
  state: IdentityStatsState,
  isContract: boolean
): void {
  if (isContract) {
    state.removedContractIdentitiesCount =
      state.removedContractIdentitiesCount + 1;
  } else {
    state.removedUserIdentitiesCount = state.removedUserIdentitiesCount + 1;
  }
}

export function decrementRemovedIdentitiesCount(
  state: IdentityStatsState,
  isContract: boolean
): void {
  if (isContract) {
    state.removedContractIdentitiesCount =
      state.removedContractIdentitiesCount - 1;
  } else {
    state.removedUserIdentitiesCount = state.removedUserIdentitiesCount - 1;
  }
}

export function incrementIdentitiesCreatedCount(
  state: IdentityStatsState,
  isContract: boolean
): void {
  if (isContract) {
    state.contractIdentitiesCreatedCount =
      state.contractIdentitiesCreatedCount + 1;
  } else {
    state.userIdentitiesCreatedCount = state.userIdentitiesCreatedCount + 1;
  }
}
