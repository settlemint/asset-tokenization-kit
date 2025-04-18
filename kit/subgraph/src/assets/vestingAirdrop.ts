import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  AirdropClaim,
  AirdropClaimIndex,
  AirdropRecipient,
  Asset,
  VestingAirdrop,
} from "../../generated/schema";
import {
  BatchClaimed,
  Claimed,
  TokensWithdrawn,
} from "../../generated/templates/VestingAirdropTemplate/VestingAirdrop";
// Potentially import Strategy events/bindings if handled here

// Assuming helper functions exist in utils
import { loadOrCreateAccount } from "../utils/account";
import { ZERO_BD, ZERO_BI } from "../utils/constants";
import { toBigDecimal } from "../utils/decimals";

// Handler for individual Claimed events
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

  let token = Asset.load(airdrop.token);
  if (!token) {
    log.error(
      "Token entity not found for address {}. Skipping Claimed event.",
      [airdrop.token.toHex()]
    );
    return;
  }

  let claimantAddress = event.params.claimant; // indexed address
  let amount = event.params.amount;
  // NOTE: Same issue as StandardAirdrop - Claimed event lacks index.

  log.info(
    "Claimed event processed (Vesting): Airdrop {}, Claimant {}, Amount {}",
    [airdropAddress.toHex(), claimantAddress.toHex(), amount.toString()]
  );

  let claimantAccount = loadOrCreateAccount(claimantAddress);
  let amountBD = toBigDecimal(amount, token.decimals);

  // Create AirdropClaim entity
  let claimId = event.transaction.hash.concatI32(event.logIndex.toI32());
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

  // Update or Create AirdropRecipient
  let recipientId = airdrop.id.concat(claimantAccount.id);
  let recipient = AirdropRecipient.load(recipientId);
  if (!recipient) {
    recipient = new AirdropRecipient(recipientId);
    recipient.airdrop = airdrop.id;
    recipient.recipient = claimantAccount.id;
    recipient.firstClaimedTimestamp = event.block.timestamp;
    recipient.totalClaimedByRecipient = ZERO_BD;
    recipient.totalClaimedByRecipientExact = ZERO_BI;
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

  // Potentially update UserVestingData if strategy interaction happens here
  // Requires more context on how VestingAirdrop interacts with strategy events/state
}

// Handler for BatchClaimed events
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

  let token = Asset.load(airdrop.token);
  if (!token) {
    log.error(
      "Token entity not found for address {}. Skipping BatchClaimed event.",
      [airdrop.token.toHex()]
    );
    return;
  }

  let claimantAddress = event.params.claimant; // indexed address
  let totalAmount = event.params.totalAmount;
  let indices = event.params.indices;
  // NOTE: Same issue as StandardAirdrop - BatchClaimed event lacks individual amounts.

  log.info(
    "BatchClaimed event processed (Vesting): Airdrop {}, Claimant {}, TotalAmount {}, IndicesCount {}",
    [
      airdropAddress.toHex(),
      claimantAddress.toHex(),
      totalAmount.toString(),
      BigInt.fromI32(indices.length).toString(),
    ]
  );

  let claimantAccount = loadOrCreateAccount(claimantAddress);
  let totalAmountBD = toBigDecimal(totalAmount, token.decimals);

  // Create AirdropClaim entity
  let claimId = event.transaction.hash.concatI32(event.logIndex.toI32());
  let claim = new AirdropClaim(claimId);
  claim.airdrop = airdrop.id;
  claim.claimant = claimantAccount.id;
  claim.totalAmount = totalAmountBD;
  claim.totalAmountExact = totalAmount;
  // claim.indices = []; // Cannot populate accurately
  claim.timestamp = event.block.timestamp;
  claim.txHash = event.transaction.hash;
  claim.blockNumber = event.block.number;
  claim.logIndex = event.logIndex;
  claim.save();

  // Update or Create AirdropRecipient
  let recipientId = airdrop.id.concat(claimantAccount.id);
  let recipient = AirdropRecipient.load(recipientId);
  if (!recipient) {
    recipient = new AirdropRecipient(recipientId);
    recipient.airdrop = airdrop.id;
    recipient.recipient = claimantAccount.id;
    recipient.firstClaimedTimestamp = event.block.timestamp;
    recipient.totalClaimedByRecipient = ZERO_BD;
    recipient.totalClaimedByRecipientExact = ZERO_BI;
    airdrop.totalRecipients = airdrop.totalRecipients + 1;
  }
  recipient.lastClaimedTimestamp = event.block.timestamp;
  recipient.totalClaimedByRecipient =
    recipient.totalClaimedByRecipient.plus(totalAmountBD);
  recipient.totalClaimedByRecipientExact =
    recipient.totalClaimedByRecipientExact.plus(totalAmount);
  recipient.save();

  // Create/Update AirdropClaimIndex entities (Inaccurately)
  let claimIndices: Bytes[] = [];
  for (let i = 0; i < indices.length; i++) {
    let index = indices[i];
    let claimIndexId = airdrop.id.toHex() + "-" + index.toString();
    let claimIndex = AirdropClaimIndex.load(claimIndexId);
    if (!claimIndex) {
      claimIndex = new AirdropClaimIndex(claimIndexId);
      claimIndex.index = index;
      claimIndex.airdrop = airdrop.id;
      claimIndex.recipient = recipient.id;
      claimIndex.amount = ZERO_BD; // Unknown
      claimIndex.amountExact = ZERO_BI; // Unknown
      claimIndex.claim = claim.id;
      claimIndex.timestamp = event.block.timestamp;
      claimIndex.save();
    } else {
      claimIndex.claim = claim.id; // Link to this claim event
      claimIndex.timestamp = event.block.timestamp;
      claimIndex.save();
    }
    claimIndices.push(claimIndex.id);
  }
  // claim.indices = claimIndices; // Derived relation
  claim.save();

  // Update Airdrop totals
  airdrop.totalClaims = airdrop.totalClaims + 1;
  airdrop.totalClaimed = airdrop.totalClaimed.plus(totalAmountBD);
  airdrop.totalClaimedExact = airdrop.totalClaimedExact.plus(totalAmount);
  airdrop.save();

  // Potentially update UserVestingData here based on strategy interaction
}

// Handler for TokensWithdrawn events
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

// Example Handler for VestingInitialized (if needed and proxied/emitted by VestingAirdrop)
// This might be necessary to create/update UserVestingData accurately.
/*
export function handleVestingInitialized(event: VestingInitialized): void {
    // This event comes from the Strategy, but might be handled in the context
    // of the Airdrop if the template listens for it or if the Airdrop proxies it.
    // Need to know which contract address `event.address` refers to.
    // Assuming event.address is the Airdrop address and strategy is linked.

    let airdropAddress = event.address;
    let airdrop = VestingAirdrop.load(airdropAddress);
    if (!airdrop) { return; }

    let strategyAddress = Address.fromBytes(airdrop.strategy);
    let strategy = LinearVestingStrategy.load(strategyAddress);
    if (!strategy) { return; }

    let accountAddress = event.params.account;
    let totalAmount = event.params.totalAmount;
    let vestingStart = event.params.vestingStart;

    let userAccount = loadOrCreateAccount(accountAddress);
    let userVestingDataId = strategy.id.concat(userAccount.id);

    let userVestingData = UserVestingData.load(userVestingDataId);
    if (!userVestingData) {
        userVestingData = new UserVestingData(userVestingDataId);
        userVestingData.strategy = strategy.id;
        userVestingData.user = userAccount.id;
        userVestingData.claimedAmountTrackedByStrategy = ZERO_BD;
        userVestingData.claimedAmountTrackedByStrategyExact = ZERO_BI;
        userVestingData.initialized = false; // Will be set below
    }

    let token = Asset.load(airdrop.token);
    let decimals = token ? token.decimals : 18; // Default decimals
    let totalAmountBD = toBigDecimal(totalAmount, decimals);

    userVestingData.totalAmountAggregated = totalAmountBD;
    userVestingData.totalAmountAggregatedExact = totalAmount;
    userVestingData.vestingStart = vestingStart;
    userVestingData.initialized = true;
    userVestingData.lastUpdated = event.block.timestamp;

    userVestingData.save();

    log.info("Processed VestingInitialized for user {} on strategy {}", [
        accountAddress.toHex(),
        strategyAddress.toHex(),
    ]);
}
*/
