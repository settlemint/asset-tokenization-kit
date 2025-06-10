import {
  Address,
  BigDecimal,
  BigInt,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import {
  AirdropClaimIndex,
  AirdropStatsData,
  //Asset,
  LinearVestingStrategy,
  UserVestingData,
  VestingAirdrop,
  VestingStatsData,
} from "../../generated/schema";
import { LinearVestingStrategy as LinearVestingStrategyContract } from "../../generated/templates/VestingAirdropTemplate/LinearVestingStrategy";
import {
  BatchClaimed,
  Claimed,
  ClaimInitialized,
  TokensWithdrawn,
} from "../../generated/templates/VestingAirdropTemplate/VestingAirdrop";

import { fetchAssetDecimals } from "../assets/fetch/asset";
import { fetchAccount } from "../utils/account";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { fetchAirdropRecipient } from "../utils/airdrop";
import { toDecimals } from "../utils/decimals";

// Helper function to generate a unique ID for stats data
function getStatsId(event: ethereum.Event): i64 {
  // For time-series entities, we need an Int8 (i64) ID
  // Convert the block number to i64 to use as a unique identifier
  return event.block.number.toI64();
}

// Helper function to update vesting statistics
function updateVestingStats(
  airdrop: VestingAirdrop,
  event: ethereum.Event
): void {
  // Load the vesting strategy
  let strategy = LinearVestingStrategy.load(airdrop.strategy);
  if (!strategy) {
    log.error("LinearVestingStrategy not found for airdrop {}", [
      airdrop.id.toHex(),
    ]);
    return;
  }

  // Load strategy contract to calculate current vesting state
  let strategyContract = LinearVestingStrategyContract.bind(
    Address.fromBytes(strategy.id)
  );

  // Initialize counters
  let vestedAmount = BigInt.fromI32(0);
  let unlockedAmount = BigInt.fromI32(0);
  let claimedVestedAmount = BigInt.fromI32(0);
  let activeVestingStreams = 0;
  let completedVestingStreams = 0;

  // In a production implementation, you would iterate over all UserVestingData entities
  // for this strategy and calculate these values
  // For now, we'll use some simplified calculations based on airdrop totals

  // For demonstration purposes, assume:
  // - vestedAmount is proportional to time passed since airdrop.deployedOn
  // - unlockedAmount is what's available to claim but not yet claimed
  // - claimedVestedAmount is what's already been claimed (airdrop.totalClaimedExact)

  let currentTime = event.block.timestamp;
  // Use deployedOn as the start time
  let startTime = airdrop.deployedOn;
  let vestingDuration = strategy.vestingDuration;
  let cliffDuration = strategy.cliffDuration;

  // Sample logic - in a real implementation, would be based on actual vesting schedules
  if (currentTime.gt(startTime.plus(cliffDuration))) {
    // Past cliff, calculate vested amount
    let timeVested = currentTime.minus(startTime);
    if (timeVested.gt(vestingDuration)) {
      // Fully vested
      vestedAmount = airdrop.totalClaimedExact; // As a simplification
      completedVestingStreams = airdrop.totalRecipients;
    } else {
      // Partially vested
      let vestingProgress = timeVested.div(vestingDuration);
      vestedAmount = airdrop.totalClaimedExact.times(vestingProgress);
      activeVestingStreams = airdrop.totalRecipients;
    }
  }

  // Claimed amount is what's already been claimed
  claimedVestedAmount = airdrop.totalClaimedExact;

  // Unlocked is vested minus claimed
  if (vestedAmount.gt(claimedVestedAmount)) {
    unlockedAmount = vestedAmount.minus(claimedVestedAmount);
  }

  // Get token decimals
  const decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));

  // Create vesting stats
  let statsId = getStatsId(event);
  let vestingStats = new VestingStatsData(statsId);
  vestingStats.timestamp = event.block.timestamp.toI64();
  vestingStats.airdrop = airdrop.id;
  vestingStats.vestedAmount = toDecimals(vestedAmount, decimals);
  vestingStats.vestedAmountExact = vestedAmount;
  vestingStats.unlockedAmount = toDecimals(unlockedAmount, decimals);
  vestingStats.unlockedAmountExact = unlockedAmount;
  vestingStats.claimedVestedAmount = toDecimals(claimedVestedAmount, decimals);
  vestingStats.claimedVestedAmountExact = claimedVestedAmount;
  vestingStats.activeVestingStreams = activeVestingStreams;
  vestingStats.completedVestingStreams = completedVestingStreams;
  vestingStats.save();
}

export function handleClaimed(event: Claimed): void {
  let airdropAddress = event.address;
  let airdrop = VestingAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "VestingAirdrop entity not found for address {}. Skipping Claimed event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  /*let token = Asset.load(airdrop.token);
  if (!token) {
    log.error(
      "Token entity not found for address {}. Skipping Claimed event.",
      [airdrop.token.toHex()]
    );
    return;
  }*/

  let claimantAddress = event.params.claimant;
  let amount = event.params.amount;

  log.info(
    "Claimed event processed (Vesting): Airdrop {}, Claimant {}, Amount {}",
    [airdropAddress.toHex(), claimantAddress.toHex(), amount.toString()]
  );

  let claimantAccount = fetchAccount(claimantAddress);

  // Get the correct token decimals
  let decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));
  let amountBD = toDecimals(amount, decimals);

  createActivityLogEntry(
    event,
    EventType.Claimed,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    [event.params.claimant]
  );

  // Check if this is a new recipient
  let recipient = fetchAirdropRecipient(airdrop.id, claimantAccount.id);
  let isNewClaimant = recipient.firstClaimedTimestamp === null;

  if (isNewClaimant) {
    recipient.firstClaimedTimestamp = event.block.timestamp;
  }
  recipient.lastClaimedTimestamp = event.block.timestamp;
  recipient.totalClaimedByRecipient =
    recipient.totalClaimedByRecipient.plus(amountBD);
  recipient.totalClaimedByRecipientExact =
    recipient.totalClaimedByRecipientExact.plus(amount);
  recipient.save();

  airdrop.totalClaims = airdrop.totalClaims + 1;
  airdrop.totalClaimed = airdrop.totalClaimed.plus(amountBD);
  airdrop.totalClaimedExact = airdrop.totalClaimedExact.plus(amount);
  airdrop.save();

  // Create AirdropStatsData entry
  let statsId = getStatsId(event);
  let statsData = new AirdropStatsData(statsId);
  statsData.timestamp = event.block.timestamp.toI64();
  statsData.airdrop = airdrop.id;
  statsData.airdropType = "Vesting";
  statsData.claims = 1;
  statsData.claimVolume = amountBD;
  statsData.claimVolumeExact = amount;
  statsData.uniqueClaimants = isNewClaimant ? 1 : 0;
  // Set PushAirdrop fields to 0
  statsData.distributions = 0;
  statsData.distributionVolume = BigDecimal.fromString("0");
  statsData.distributionVolumeExact = BigInt.fromI32(0);
  statsData.save();

  // Update vesting stats
  updateVestingStats(airdrop, event);
}

export function handleBatchClaimed(event: BatchClaimed): void {
  let airdropAddress = event.address;
  let airdrop = VestingAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "VestingAirdrop entity not found for address {}. Skipping BatchClaimed event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  // let token = Asset.load(airdrop.token); // Removed: Asset interface cannot be loaded directly
  // if (!token) { // Removed
  //   log.error( // Removed
  //     "Token entity not found for address {}. Skipping BatchClaimed event.", // Removed
  //     [airdrop.token.toHex()] // Removed
  //   );
  //   return; // Removed
  // } // Removed

  // Extract event parameters
  const claimantAddress = event.params.claimant;
  const totalAmount = event.params.totalAmount;
  const indices = event.params.indices;
  const amounts = event.params.amounts; // New parameter from enhanced event

  // With the contract update, we now have individual amounts per index

  // Log event information
  log.info(
    "BatchClaimed event processed (Vesting): Airdrop {}, Claimant {}, TotalAmount {}, IndicesCount {}",
    [
      airdropAddress.toHex(),
      claimantAddress.toHex(),
      totalAmount.toString(),
      BigInt.fromI32(indices.length).toString(),
    ]
  );

  // Process batch claim using actual amounts for each index
  processBatchClaim(
    airdrop,
    claimantAddress,
    totalAmount,
    indices,
    amounts, // Pass the actual amounts instead of calculating averages
    event
  );

  // Create AirdropStatsData entry
  let statsId = getStatsId(event);
  let statsData = new AirdropStatsData(statsId);
  statsData.timestamp = event.block.timestamp.toI64();
  statsData.airdrop = airdrop.id;
  statsData.airdropType = "Vesting";
  statsData.claims = 1;

  // Get token decimals
  const decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));
  const totalAmountBD = toDecimals(totalAmount, decimals);

  statsData.claimVolume = totalAmountBD;
  statsData.claimVolumeExact = totalAmount;

  // Check if this is a new claimant (should be determined in processBatchClaim)
  let recipient = fetchAirdropRecipient(airdrop.id, claimantAddress);
  const isNewClaimant = recipient.firstClaimedTimestamp === null;
  statsData.uniqueClaimants = isNewClaimant ? 1 : 0;

  // Set PushAirdrop fields to 0
  statsData.distributions = 0;
  statsData.distributionVolume = BigDecimal.fromString("0");
  statsData.distributionVolumeExact = BigInt.fromI32(0);
  statsData.save();

  // Update vesting stats
  updateVestingStats(airdrop, event);
}

export function handleTokensWithdrawn(event: TokensWithdrawn): void {
  let airdropAddress = event.address;
  let airdrop = VestingAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "VestingAirdrop entity not found for address {}. Skipping TokensWithdrawn event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  // Get token details
  let tokenAddress = Address.fromBytes(airdrop.token);
  let amount = event.params.amount;
  let decimals = fetchAssetDecimals(tokenAddress);
  let amountBD = toDecimals(amount, decimals);

  log.info(
    "TokensWithdrawn event processed (Vesting): Airdrop {}, To {}, Amount {} ({} with {} decimals)",
    [
      airdropAddress.toHex(),
      event.params.to.toHex(),
      amount.toString(),
      amountBD.toString(),
      decimals.toString(),
    ]
  );

  airdrop.isWithdrawn = true;
  airdrop.save();

  // Update vesting stats one last time
  updateVestingStats(airdrop, event);
}

export function handleClaimInitialized(event: ClaimInitialized): void {
  let airdropAddress = event.address;
  let airdrop = VestingAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "VestingAirdrop entity not found for address {}. Skipping ClaimInitialized event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let claimantAddress = event.params.claimant;
  let allocatedAmount = event.params.allocatedAmount;

  log.info(
    "ClaimInitialized event processed: Airdrop {}, Claimant {}, AllocatedAmount {}",
    [
      airdropAddress.toHex(),
      claimantAddress.toHex(),
      allocatedAmount.toString(),
    ]
  );

  let claimantAccount = fetchAccount(claimantAddress);
  let decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));
  let allocatedAmountBD = toDecimals(allocatedAmount, decimals);

  // Get or create AirdropRecipient using utility function
  let recipient = fetchAirdropRecipient(airdrop.id, claimantAccount.id);

  // Update recipient for allocation initialization
  if (recipient.firstClaimedTimestamp === null) {
    recipient.firstClaimedTimestamp = event.block.timestamp;
    airdrop.totalRecipients = airdrop.totalRecipients + 1;
  }
  recipient.lastClaimedTimestamp = event.block.timestamp;
  // Note: We don't increase claimed amounts here since no tokens are actually transferred
  recipient.save();

  // If we have strategy info, update the UserVestingData
  let strategy = LinearVestingStrategy.load(airdrop.strategy);
  if (strategy) {
    let userVestingDataId =
      strategy.id.toHex() + "-" + claimantAccount.id.toHex();
    let userVestingData = UserVestingData.load(userVestingDataId);

    if (!userVestingData) {
      userVestingData = new UserVestingData(userVestingDataId);
      userVestingData.strategy = strategy.id;
      userVestingData.user = claimantAccount.id;
      userVestingData.totalAmountAggregatedExact = allocatedAmount;
      userVestingData.totalAmountAggregated = allocatedAmountBD;
      userVestingData.claimedAmountTrackedByStrategyExact = BigInt.fromI32(0);
      userVestingData.claimedAmountTrackedByStrategy =
        BigDecimal.fromString("0");
      userVestingData.vestingStart = event.block.timestamp;
      userVestingData.initialized = true;
      userVestingData.lastUpdated = event.block.timestamp;
    } else {
      // If already exists, update with new allocation
      userVestingData.totalAmountAggregatedExact =
        userVestingData.totalAmountAggregatedExact.plus(allocatedAmount);
      userVestingData.totalAmountAggregated =
        userVestingData.totalAmountAggregated.plus(allocatedAmountBD);
      userVestingData.lastUpdated = event.block.timestamp;
      userVestingData.initialized = true;
    }

    userVestingData.save();
  }

  airdrop.save();

  // Update vesting stats on initialization
  updateVestingStats(airdrop, event);
}

/**
 * Helper function to process batch claims with individual amounts
 */
function processBatchClaim(
  airdrop: VestingAirdrop,
  claimantAddress: Address,
  totalAmount: BigInt,
  indices: BigInt[],
  amounts: BigInt[],
  event: ethereum.Event
): void {
  const claimantAccount = fetchAccount(claimantAddress);

  // Get the correct token decimals
  const decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));
  const totalAmountBD = toDecimals(totalAmount, decimals);

  // Create AirdropClaim entity

  createActivityLogEntry(
    event,
    EventType.Claimed,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    [claimantAddress]
  );

  // Update or create AirdropRecipient
  let recipient = fetchAirdropRecipient(airdrop.id, claimantAccount.id);
  if (recipient.firstClaimedTimestamp === null) {
    recipient.firstClaimedTimestamp = event.block.timestamp;
    airdrop.totalRecipients = airdrop.totalRecipients + 1;
  }
  recipient.lastClaimedTimestamp = event.block.timestamp;
  recipient.totalClaimedByRecipient =
    recipient.totalClaimedByRecipient.plus(totalAmountBD);
  recipient.totalClaimedByRecipientExact =
    recipient.totalClaimedByRecipientExact.plus(totalAmount);
  recipient.save();

  // Create/update AirdropClaimIndex entities with actual amounts
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    const amount = amounts[i];
    const amountBD = toDecimals(amount, decimals); // Use actual token decimals

    const claimIndexId = airdrop.id.toHex() + "-" + index.toString();
    let claimIndex = AirdropClaimIndex.load(claimIndexId);
    if (!claimIndex) {
      claimIndex = new AirdropClaimIndex(claimIndexId);
      claimIndex.index = index;
      claimIndex.airdrop = airdrop.id;
      claimIndex.recipient = recipient.id;
      claimIndex.amount = amountBD;
      claimIndex.amountExact = amount;
      claimIndex.timestamp = event.block.timestamp;
      claimIndex.save();
    } else {
      // If index was somehow claimed before (shouldn't happen)
      claimIndex.timestamp = event.block.timestamp;
      claimIndex.amount = amountBD;
      claimIndex.amountExact = amount;
      claimIndex.save();
    }
  }

  // Update airdrop totals
  airdrop.totalClaims = airdrop.totalClaims + 1;
  airdrop.totalClaimed = airdrop.totalClaimed.plus(totalAmountBD);
  airdrop.totalClaimedExact = airdrop.totalClaimedExact.plus(totalAmount);
  airdrop.save();
}
