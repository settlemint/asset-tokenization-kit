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
  StandardAirdrop,
} from "../../generated/schema";
import {
  BatchClaimed,
  Claimed,
  TokensWithdrawn,
} from "../../generated/templates/StandardAirdropTemplate/StandardAirdrop";

import { fetchAssetDecimals } from "../assets/fetch/asset";
import { fetchAccount } from "../utils/account";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { fetchAirdropRecipient } from "../utils/airdrop";
import { toDecimals } from "../utils/decimals";

function getStatsId(event: ethereum.Event): i64 {
  return event.block.number.toI64();
}

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

  log.info("Claimed event processed: Airdrop {}, Claimant {}, Amount {}", [
    airdropAddress.toHex(),
    claimantAddress.toHex(),
    amount.toString(),
  ]);

  let claimantAccount = fetchAccount(claimantAddress);

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

  // Update Airdrop totals
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

  const decimals = fetchAssetDecimals(Address.fromBytes(airdrop.token));
  const totalAmountBD = toDecimals(totalAmount, decimals);

  createActivityLogEntry(
    event,
    EventType.Claimed,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    [claimantAddress]
  );

  // Check if this is a new recipient
  let recipient = fetchAirdropRecipient(airdrop.id, claimantAccount.id);
  let isNewClaimant = recipient.firstClaimedTimestamp === null;

  // Update or create AirdropRecipient
  if (isNewClaimant) {
    recipient.firstClaimedTimestamp = event.block.timestamp;
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
