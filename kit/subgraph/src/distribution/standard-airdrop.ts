import {
  Address,
  BigDecimal,
  BigInt,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import {
  AirdropStatsData,
  // Asset is an interface and cannot be loaded directly
  StandardAirdrop,
} from "../../generated/schema";
import {
  BatchClaimed,
  Claimed,
  OwnershipTransferred,
  TokensWithdrawn,
} from "../../generated/templates/StandardAirdropTemplate/StandardAirdrop";

// Use fetchAccount and direct constants
import { fetchAssetDecimals } from "../assets/fetch/asset";
import { fetchAccount } from "../utils/account";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import {
  fetchAirdropClaimIndex,
  fetchAirdropRecipient,
} from "../utils/airdrop";
import { toDecimals } from "../utils/decimals";

// Helper function to generate a unique ID for stats data
function getStatsId(event: ethereum.Event): i64 {
  // For time-series entities, we need an Int8 (i64) ID
  // Convert the block number to i64 to use as a unique identifier
  return event.block.number.toI64();
}

// Handler for individual Claimed events
export function handleClaimed(event: Claimed): void {
  let airdropAddress = event.address;
  let airdrop = StandardAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "StandardAirdrop entity not found for address {}. Skipping Claimed event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  let claimantAddress = event.params.claimant; // indexed address
  let amount = event.params.amount;
  let index = event.params.index;

  log.info("Claimed event processed: Airdrop {}, Claimant {}, Amount {}", [
    airdropAddress.toHex(),
    claimantAddress.toHex(),
    amount.toString(),
  ]);

  let claimantAccount = fetchAccount(claimantAddress);

  // Get the correct token decimals using our helper function
  let decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));
  let amountBD = toDecimals(amount, decimals);

  createActivityLogEntry(
    event,
    EventType.Claimed,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    [event.params.claimant]
  );

  // Use the utility function to fetch or create recipient
  const recipient = fetchAirdropRecipient(
    airdrop.id,
    claimantAccount.id,
    event,
    amountBD,
    amount
  );

  // Use the utility function to create/update the claim index
  fetchAirdropClaimIndex(
    airdrop.id,
    recipient.id,
    index,
    amount,
    decimals,
    event
  );

  // Update Airdrop totals
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
  // Convert BigInt timestamp to i64 type
  statsData.timestamp = event.block.timestamp.toI64();
  statsData.airdrop = airdrop.id;
  statsData.airdropType = "Standard";
  statsData.claims = 1;
  statsData.claimVolume = amountBD;
  statsData.claimVolumeExact = amount;
  statsData.uniqueClaimants = isNewClaimant ? 1 : 0;
  // Set PushAirdrop fields to 0
  statsData.distributions = 0;
  statsData.distributionVolume = BigDecimal.fromString("0");
  statsData.distributionVolumeExact = BigInt.fromI32(0);
  statsData.save();
}

/**
 * Helper function to process batch claims with individual amounts
 */
function processBatchClaim(
  airdrop: StandardAirdrop,
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

  createActivityLogEntry(
    event,
    EventType.Claimed,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    [claimantAddress]
  );

  // Use the utility function to fetch or create recipient
  const recipient = fetchAirdropRecipient(
    airdrop.id,
    claimantAccount.id,
    event,
    totalAmountBD,
    totalAmount
  );

  // Create/update AirdropClaimIndex entities with actual amounts
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    const amount = amounts[i];

    // Use the utility function to create/update the claim index
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
  const isNewClaimant =
    recipient.firstClaimedTimestamp === event.block.timestamp;

  if (isNewClaimant) {
    airdrop.totalRecipients = airdrop.totalRecipients + 1;
  }
  airdrop.totalClaims = airdrop.totalClaims + 1;
  airdrop.totalClaimed = airdrop.totalClaimed.plus(totalAmountBD);
  airdrop.totalClaimedExact = airdrop.totalClaimedExact.plus(totalAmount);
  airdrop.save();

  // Create AirdropStatsData entry
  let statsId = getStatsId(event);
  let statsData = new AirdropStatsData(statsId);
  // Convert BigInt timestamp to i64 type
  statsData.timestamp = event.block.timestamp.toI64();
  statsData.airdrop = airdrop.id;
  statsData.airdropType = "Standard";
  statsData.claims = 1;
  statsData.claimVolume = totalAmountBD;
  statsData.claimVolumeExact = totalAmount;
  statsData.uniqueClaimants = isNewClaimant ? 1 : 0;
  // Set PushAirdrop fields to 0
  statsData.distributions = 0;
  statsData.distributionVolume = BigDecimal.fromString("0");
  statsData.distributionVolumeExact = BigInt.fromI32(0);
  statsData.save();
}

// Handler for BatchClaimed events
export function handleBatchClaimed(event: BatchClaimed): void {
  let airdropAddress = event.address;
  let airdrop = StandardAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "StandardAirdrop entity not found for address {}. Skipping BatchClaimed event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  // Extract event parameters
  const claimantAddress = event.params.claimant;
  const totalAmount = event.params.totalAmount;
  const indices = event.params.indices;
  const amounts = event.params.amounts; // New parameter from enhanced event

  // With the contract update, we now have individual amounts per index
  log.info(
    "BatchClaimed event processed: Airdrop {}, Claimant {}, TotalAmount {}, IndicesCount {}",
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
    amounts,
    event
  );
}

// Handler for TokensWithdrawn events
export function handleTokensWithdrawn(event: TokensWithdrawn): void {
  let airdropAddress = event.address;
  let airdrop = StandardAirdrop.load(airdropAddress);

  if (!airdrop) {
    log.error(
      "StandardAirdrop entity not found for address {}. Skipping TokensWithdrawn event.",
      [airdropAddress.toHex()]
    );
    return;
  }

  log.info("TokensWithdrawn event processed: Airdrop {}, To {}, Amount {}", [
    airdropAddress.toHex(),
    event.params.to.toHex(),
    event.params.amount.toString(),
  ]);

  airdrop.isWithdrawn = true;
  // Optionally store withdrawn amount and recipient if needed in schema
  airdrop.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let airdrop = StandardAirdrop.load(event.address);
  if (!airdrop) {
    return;
  }

  // Update the owner using fetchAccount
  airdrop.owner = fetchAccount(event.params.newOwner).id;
  airdrop.save();
}
