import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import { AirdropStatsData, PushAirdrop } from "../../generated/schema";
import {
  BatchDistributed,
  DistributionCapUpdated,
  MerkleRootUpdated,
  OwnershipTransferred,
  TokensDistributed,
  TokensWithdrawn,
} from "../../generated/templates/PushAirdropTemplate/PushAirdrop";

// Use fetchAccount for consistent account entity creation
import { fetchAssetDecimals } from "../assets/fetch/asset";
import { fetchAccount } from "../utils/account";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { toDecimals } from "../utils/decimals";

// Helper function to generate a unique ID for stats data
function getStatsId(event: ethereum.Event): i64 {
  // For time-series entities, we need an Int8 (i64) ID
  // Convert the block number to i64 to use as a unique identifier
  return event.block.number.toI64();
}

// Helper function to update distribution statistics
function updateDistributionStats(
  airdrop: PushAirdrop,
  amount: BigInt,
  recipientCount: i32,
  distributorAccount: Bytes,
  event: ethereum.Event
): void {
  // Get token decimals
  const decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));
  const amountBD = toDecimals(amount, decimals);

  // Create AirdropStatsData entry
  let statsId = getStatsId(event);
  let statsData = new AirdropStatsData(statsId);
  // Directly assign the timestamp as i64
  statsData.timestamp = event.block.timestamp.toI64();
  statsData.airdrop = airdrop.id;
  statsData.airdropType = "Push";

  // Set claim fields to 0
  statsData.claims = 0;
  statsData.claimVolume = BigDecimal.fromString("0");
  statsData.claimVolumeExact = BigInt.fromI32(0);
  statsData.uniqueClaimants = 0;

  // Set distribution fields
  statsData.distributions = recipientCount;
  statsData.distributionVolume = amountBD;
  statsData.distributionVolumeExact = amount;
  statsData.save();
}

// Handler for individual token distribution events
export function handleTokensDistributed(event: TokensDistributed): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping TokensDistributed event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let recipientAddress = event.params.recipient;
  let amount = event.params.amount;

  log.info(
    "TokensDistributed event processed: Airdrop {}, Recipient {}, Amount {}",
    [airdropAddress.toHex(), recipientAddress.toHex(), amount.toString()]
  );

  // Get distributor and recipient accounts
  let distributor = fetchAccount(event.transaction.from);
  let recipient = fetchAccount(recipientAddress);

  // Get token decimals
  let decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));
  let amountBD = toDecimals(amount, decimals);

  // Create PushDistribution entity
  createActivityLogEntry(
    event,
    EventType.Distribution,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    [event.params.recipient]
  );

  // Update airdrop metadata
  airdrop.totalDistributed = airdrop.totalDistributed.plus(amount);
  airdrop.save();

  // Update distribution statistics
  updateDistributionStats(
    airdrop,
    amount,
    1, // Single recipient
    distributor.id,
    event
  );
}

// Handler for batch distribution events
export function handleBatchDistributed(event: BatchDistributed): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping BatchDistributed event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let recipientCount = event.params.recipientCount.toI32();
  let totalAmount = event.params.totalAmount;

  log.info(
    "BatchDistributed event processed: Airdrop {}, RecipientCount {}, TotalAmount {}",
    [airdropAddress.toHex(), recipientCount.toString(), totalAmount.toString()]
  );

  // Get distributor account
  let distributor = fetchAccount(event.transaction.from);

  // Get token decimals
  let decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));
  let totalAmountBD = toDecimals(totalAmount, decimals);

  // Create PushBatchDistribution entity
  createActivityLogEntry(
    event,
    EventType.BatchDistribution,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );

  // Update airdrop data
  // Note: Individual distributions within the batch will already have updated
  // the totalDistributed value via their individual TokensDistributed events

  // Update distribution statistics
  updateDistributionStats(
    airdrop,
    totalAmount,
    recipientCount,
    distributor.id,
    event
  );
}

// Handler for tokens withdrawal event
export function handleTokensWithdrawn(event: TokensWithdrawn): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping TokensWithdrawn event.",
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
    "TokensWithdrawn event processed (Push): Airdrop {}, To {}, Amount {} ({} with {} decimals)",
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
}

// Handler for MerkleRootUpdated event
export function handleMerkleRootUpdated(event: MerkleRootUpdated): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping MerkleRootUpdated event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let oldRoot = event.params.oldRoot;
  let newRoot = event.params.newRoot;

  log.info(
    "MerkleRootUpdated event processed: Airdrop {}, OldRoot {}, NewRoot {}",
    [airdropAddress.toHex(), oldRoot.toHexString(), newRoot.toHexString()]
  );

  // Create MerkleRootUpdate entity to track the change
  createActivityLogEntry(
    event,
    EventType.MerkleRootUpdated,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );

  // Update airdrop with new merkle root
  airdrop.merkleRoot = newRoot;
  airdrop.save();
}

// Handler for DistributionCapUpdated event
export function handleDistributionCapUpdated(
  event: DistributionCapUpdated
): void {
  let airdropAddress = event.address;
  let airdrop = PushAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "PushAirdrop entity not found for address {}. Skipping DistributionCapUpdated event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let oldCap = event.params.oldCap;
  let newCap = event.params.newCap;

  log.info(
    "DistributionCapUpdated event processed: Airdrop {}, OldCap {}, NewCap {}",
    [airdropAddress.toHex(), oldCap.toString(), newCap.toString()]
  );

  airdrop.distributionCap = newCap;
  airdrop.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let airdrop = PushAirdrop.load(event.address);
  if (!airdrop) {
    return;
  }

  // Update the owner using fetchAccount
  airdrop.owner = fetchAccount(event.params.newOwner).id;
  airdrop.save();
}
