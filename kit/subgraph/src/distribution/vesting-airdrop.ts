import {
  Address,
  BigDecimal,
  BigInt,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import {
  AirdropStatsData,
  //Asset,
  LinearVestingStrategy,
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
import {
  fetchAirdropClaimIndex,
  fetchAirdropRecipient,
  fetchUserVestingData,
} from "../utils/airdrop";
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
  const recipient = fetchAirdropRecipient(
    airdrop.id,
    claimantAccount.id,
    event,
    amountBD,
    amount
  );

  const isNewClaimant =
    recipient.firstClaimedTimestamp === event.block.timestamp;
  if (isNewClaimant) {
    airdrop.totalRecipients = airdrop.totalRecipients + 1;
  }
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

  const claimantAddress = event.params.claimant;
  const totalAmount = event.params.totalAmount;
  const indices = event.params.indices;
  const amounts = event.params.amounts;

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
  const recipient = fetchAirdropRecipient(
    airdrop.id,
    claimantAddress,
    event,
    totalAmountBD,
    totalAmount
  );
  const isNewClaimant =
    recipient.firstClaimedTimestamp === event.block.timestamp;
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

  // Update AirdropRecipient to track the initial allocation
  let recipient = fetchAirdropRecipient(
    airdrop.id,
    claimantAccount.id,
    event,
    BigDecimal.zero(),
    BigInt.zero()
  );
  const isNewClaimant =
    recipient.firstClaimedTimestamp === event.block.timestamp;
  if (isNewClaimant) {
    airdrop.totalRecipients = airdrop.totalRecipients + 1;
  }

  // If we have strategy info, update the UserVestingData
  let strategy = LinearVestingStrategy.load(airdrop.strategy);
  if (strategy) {
    fetchUserVestingData(
      strategy.id,
      claimantAccount.id,
      allocatedAmount,
      allocatedAmountBD,
      event
    );
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
  const recipient = fetchAirdropRecipient(
    airdrop.id,
    claimantAccount.id,
    event,
    totalAmountBD,
    totalAmount
  );

  const isNewClaimant =
    recipient.firstClaimedTimestamp === event.block.timestamp;
  if (isNewClaimant) {
    airdrop.totalRecipients = airdrop.totalRecipients + 1;
  }

  // Create/update AirdropClaimIndex entities with actual amounts
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    const amount = amounts[i];

    fetchAirdropClaimIndex(
      airdrop.id,
      recipient.id,
      index,
      amount,
      decimals,
      event
    );
  }

  // Update airdrop totals
  airdrop.totalClaims = airdrop.totalClaims + 1;
  airdrop.totalClaimed = airdrop.totalClaimed.plus(totalAmountBD);
  airdrop.totalClaimedExact = airdrop.totalClaimedExact.plus(totalAmount);
  airdrop.save();
}
