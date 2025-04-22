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
  //Asset,
  LinearVestingStrategy,
  UserVestingData,
  VestingAirdrop,
} from "../../generated/schema";
import { VestingInitialized } from "../../generated/templates/VestingAirdropTemplate/LinearVestingStrategy";
import {
  BatchClaimed,
  Claimed,
  TokensWithdrawn,
} from "../../generated/templates/VestingAirdropTemplate/VestingAirdrop";

import { fetchAccount } from "../fetch/account";
import { toDecimals } from "../utils/decimals";

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
  let amountBD = toDecimals(amount, 18);

  let claimId = event.transaction.hash
    .concatI32(event.logIndex.toI32())
    .toHex();
  let claim = new AirdropClaim(claimId);
  claim.airdrop = airdrop.id;
  claim.claimant = claimantAccount.id;
  claim.totalAmount = amountBD;
  claim.totalAmountExact = amount;
  claim.timestamp = event.block.timestamp;
  claim.txHash = event.transaction.hash;
  claim.blockNumber = event.block.number;
  claim.logIndex = event.logIndex;
  claim.save();

  let recipientId = airdrop.id.concat(claimantAccount.id).toHex();
  let recipient = AirdropRecipient.load(recipientId);
  if (!recipient) {
    recipient = new AirdropRecipient(recipientId);
    recipient.airdrop = airdrop.id;
    recipient.recipient = claimantAccount.id;
    recipient.firstClaimedTimestamp = event.block.timestamp;
    recipient.totalClaimedByRecipient = BigDecimal.fromString("0");
    recipient.totalClaimedByRecipientExact = BigInt.fromI32(0);
    airdrop.totalRecipients = airdrop.totalRecipients + 1;
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

  log.info(
    "TokensWithdrawn event processed (Vesting): Airdrop {}, To {}, Amount {}",
    [
      airdropAddress.toHex(),
      event.params.to.toHex(),
      event.params.amount.toString(),
    ]
  );

  airdrop.isWithdrawn = true;
  airdrop.save();
}

export function handleVestingInitialized(event: VestingInitialized): void {
  let strategyAddress = event.address;
  let strategy = LinearVestingStrategy.load(strategyAddress);
  if (!strategy) {
    log.error("LinearVestingStrategy not found: {}", [strategyAddress.toHex()]);
    return;
  }

  // Use the direct reference field we added to the schema
  let airdrop = VestingAirdrop.load(strategy.airdropRef);
  if (!airdrop) {
    log.error("Associated VestingAirdrop not found for strategy: {}", [
      strategyAddress.toHex(),
    ]);
    return;
  }

  let userAddress = event.params.account;
  let totalAmount = event.params.totalAmount;
  let vestingStart = event.params.vestingStart;

  let userAccount = fetchAccount(userAddress);

  let userVestingDataId = strategy.id.toHex() + "-" + userAccount.id.toHex();
  let userVestingData = UserVestingData.load(userVestingDataId);
  if (!userVestingData) {
    userVestingData = new UserVestingData(userVestingDataId);
    userVestingData.strategy = strategy.id;
    userVestingData.user = userAccount.id;
    userVestingData.totalAmountAggregatedExact = BigInt.zero();
    userVestingData.totalAmountAggregated = BigDecimal.zero();
    userVestingData.claimedAmountTrackedByStrategyExact = BigInt.zero();
    userVestingData.claimedAmountTrackedByStrategy = BigDecimal.zero();
  }

  let decimals = 18;

  userVestingData.totalAmountAggregatedExact =
    userVestingData.totalAmountAggregatedExact.plus(totalAmount);
  userVestingData.totalAmountAggregated = toDecimals(
    userVestingData.totalAmountAggregatedExact,
    decimals
  );
  userVestingData.vestingStart = vestingStart;
  userVestingData.initialized = true;
  userVestingData.lastUpdated = event.block.timestamp;
  userVestingData.save();

  log.info(
    "VestingInitialized event processed: Strategy {}, User {}, Amount {}, Start {}",
    [
      strategyAddress.toHex(),
      userAddress.toHex(),
      totalAmount.toString(),
      vestingStart.toString(),
    ]
  );
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
  const totalAmountBD = toDecimals(totalAmount, 18); // Assuming 18 decimals

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

  // Update or create AirdropRecipient
  const recipientId = airdrop.id.concat(claimantAccount.id).toHex();
  let recipient = AirdropRecipient.load(recipientId);
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
    const amountBD = toDecimals(amount, 18); // Assuming 18 decimals

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
}
