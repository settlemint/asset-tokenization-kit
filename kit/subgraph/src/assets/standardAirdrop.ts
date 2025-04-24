import {
  Address,
  BigDecimal,
  BigInt,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import {
  AirdropClaim,
  AirdropClaimIndex,
  AirdropRecipient,
  AirdropStatsData,
  Bond,
  CryptoCurrency,
  Deposit,
  Equity,
  Fund,
  StableCoin,
  // Asset is an interface and cannot be loaded directly
  StandardAirdrop,
} from "../../generated/schema";
import {
  BatchClaimed,
  Claimed,
  TokensWithdrawn,
} from "../../generated/templates/StandardAirdropTemplate/StandardAirdrop";

// Use fetchAccount and direct constants
import { fetchAccount } from "../fetch/account";
import { toDecimals } from "../utils/decimals";

// Helper function to get token decimals from any asset type
function getTokenDecimals(tokenAddress: Address): i32 {
  // Try loading each possible asset type
  let crypto = CryptoCurrency.load(tokenAddress);
  if (crypto) return crypto.decimals;

  let stable = StableCoin.load(tokenAddress);
  if (stable) return stable.decimals;

  let bond = Bond.load(tokenAddress);
  if (bond) return bond.decimals;

  let equity = Equity.load(tokenAddress);
  if (equity) return equity.decimals;

  let fund = Fund.load(tokenAddress);
  if (fund) return fund.decimals;

  let deposit = Deposit.load(tokenAddress);
  if (deposit) return deposit.decimals;

  // Default to 18 if not found
  log.warning("Token not found for address {}, defaulting to 18 decimals", [
    tokenAddress.toHex(),
  ]);
  return 18;
}

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

  log.info("Claimed event processed: Airdrop {}, Claimant {}, Amount {}", [
    airdropAddress.toHex(),
    claimantAddress.toHex(),
    amount.toString(),
  ]);

  let claimantAccount = fetchAccount(claimantAddress);

  // Get the correct token decimals using our helper function
  let decimals = getTokenDecimals(Address.fromBytes(airdrop.token));
  let amountBD = toDecimals(amount, decimals);

  // Create AirdropClaim entity
  let claimId = event.transaction.hash
    .concatI32(event.logIndex.toI32())
    .toHex();
  let claim = new AirdropClaim(claimId);
  claim.airdrop = airdrop.id;
  claim.claimant = claimantAccount.id;
  claim.totalAmount = amountBD;
  claim.totalAmountExact = amount;
  // claim.indices = []; // Cannot populate from this event
  claim.timestamp = event.block.timestamp;
  claim.txHash = event.transaction.hash;
  claim.blockNumber = event.block.number;
  claim.logIndex = event.logIndex;
  claim.save();

  // Check if this is a new recipient
  let recipientId = airdrop.id.concat(claimantAccount.id).toHex();
  let recipient = AirdropRecipient.load(recipientId);
  let isNewClaimant = recipient == null;

  // Update or Create AirdropRecipient
  if (!recipient) {
    recipient = new AirdropRecipient(recipientId);
    recipient.airdrop = airdrop.id;
    recipient.recipient = claimantAccount.id;
    recipient.firstClaimedTimestamp = event.block.timestamp;
    recipient.totalClaimedByRecipient = BigDecimal.fromString("0");
    recipient.totalClaimedByRecipientExact = BigInt.fromI32(0);
    // Increment unique recipient count on airdrop
    airdrop.totalRecipients = airdrop.totalRecipients + 1;
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
  // Use timestamp directly without wrapping in Timestamp constructor
  statsData.timestamp = event.block.timestamp;
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
  const decimals = getTokenDecimals(Address.fromBytes(airdrop.token));
  const totalAmountBD = toDecimals(totalAmount, decimals);

  // Create AirdropClaim entity
  const claimId = event.transaction.hash
    .concatI32(event.logIndex.toI32())
    .toHex();
  const claim = new AirdropClaim(claimId);
  claim.airdrop = airdrop.id;
  claim.claimant = claimantAccount.id;
  claim.totalAmount = totalAmountBD;
  claim.totalAmountExact = totalAmount;
  claim.timestamp = event.block.timestamp;
  claim.txHash = event.transaction.hash;
  claim.blockNumber = event.block.number;
  claim.logIndex = event.logIndex;
  claim.save();

  // Check if this is a new recipient
  const recipientId = airdrop.id.concat(claimantAccount.id).toHex();
  let recipient = AirdropRecipient.load(recipientId);
  let isNewClaimant = recipient == null;

  // Update or create AirdropRecipient
  if (!recipient) {
    recipient = new AirdropRecipient(recipientId);
    recipient.airdrop = airdrop.id;
    recipient.recipient = claimantAccount.id;
    recipient.firstClaimedTimestamp = event.block.timestamp;
    recipient.totalClaimedByRecipient = BigDecimal.fromString("0");
    recipient.totalClaimedByRecipientExact = BigInt.fromI32(0);
    // Increment unique recipient count on airdrop
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
      claimIndex.claim = claim.id;
      claimIndex.timestamp = event.block.timestamp;
      claimIndex.save();
    } else {
      // If index was somehow claimed before (shouldn't happen)
      claimIndex.claim = claim.id;
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
  // Use timestamp directly without wrapping in Timestamp constructor
  statsData.timestamp = event.block.timestamp;
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
