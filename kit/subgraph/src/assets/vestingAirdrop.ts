import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
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
  let amountBD = toDecimals(amount, token.decimals);

  let claimId = event.transaction.hash.concatI32(event.logIndex.toI32());
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

  let recipientId = airdrop.id.concat(claimantAccount.id);
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

  let token = Asset.load(airdrop.token);
  if (!token) {
    log.error(
      "Token entity not found for address {}. Skipping BatchClaimed event.",
      [airdrop.token.toHex()]
    );
    return;
  }

  let claimantAddress = event.params.claimant;
  let totalAmount = event.params.totalAmount;
  let indices = event.params.indices;

  log.info(
    "BatchClaimed event processed (Vesting): Airdrop {}, Claimant {}, TotalAmount {}, IndicesCount {}",
    [
      airdropAddress.toHex(),
      claimantAddress.toHex(),
      totalAmount.toString(),
      BigInt.fromI32(indices.length).toString(),
    ]
  );

  let claimantAccount = fetchAccount(claimantAddress);
  let totalAmountBD = toDecimals(totalAmount, token.decimals);

  let claimId = event.transaction.hash.concatI32(event.logIndex.toI32());
  let claim = new AirdropClaim(claimId);
  claim.airdrop = airdrop.id;
  claim.claimant = claimantAccount.id;
  claim.totalAmount = totalAmountBD;
  claim.totalAmountExact = totalAmount;
  claim.timestamp = event.block.timestamp;
  claim.txHash = event.transaction.hash;
  claim.blockNumber = event.block.number;
  claim.logIndex = event.logIndex;
  claim.save();

  let recipientId = airdrop.id.concat(claimantAccount.id);
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
    recipient.totalClaimedByRecipient.plus(totalAmountBD);
  recipient.totalClaimedByRecipientExact =
    recipient.totalClaimedByRecipientExact.plus(totalAmount);
  recipient.save();

  for (let i = 0; i < indices.length; i++) {
    let index = indices[i];
    let claimIndexId = airdrop.id.toHex() + "-" + index.toString();
    let claimIndex = AirdropClaimIndex.load(claimIndexId);
    if (!claimIndex) {
      claimIndex = new AirdropClaimIndex(claimIndexId);
      claimIndex.index = index;
      claimIndex.airdrop = airdrop.id;
      claimIndex.recipient = recipient.id;
      claimIndex.amount = BigDecimal.fromString("0");
      claimIndex.amountExact = BigInt.fromI32(0);
      claimIndex.claim = claim.id;
      claimIndex.timestamp = event.block.timestamp;
      claimIndex.save();
    } else {
      claimIndex.claim = claim.id;
      claimIndex.timestamp = event.block.timestamp;
      claimIndex.save();
    }
  }

  airdrop.totalClaims = airdrop.totalClaims + 1;
  airdrop.totalClaimed = airdrop.totalClaimed.plus(totalAmountBD);
  airdrop.totalClaimedExact = airdrop.totalClaimedExact.plus(totalAmount);
  airdrop.save();
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
  let airdropAddress = event.address;
  let airdrop = VestingAirdrop.load(airdropAddress);
  if (!airdrop) {
    return;
  }

  let strategyAddress = Address.fromBytes(airdrop.strategy);
  let strategy = LinearVestingStrategy.load(strategyAddress);
  if (!strategy) {
    return;
  }

  let accountAddress = event.params.account;
  let totalAmount = event.params.totalAmount;
  let vestingStart = event.params.vestingStart;

  let userAccount = fetchAccount(accountAddress);
  let userVestingDataId = strategy.id.concat(userAccount.id);

  let userVestingData = UserVestingData.load(userVestingDataId);
  if (!userVestingData) {
    userVestingData = new UserVestingData(userVestingDataId);
    userVestingData.strategy = strategy.id;
    userVestingData.user = userAccount.id;
    userVestingData.claimedAmountTrackedByStrategy = BigDecimal.fromString("0");
    userVestingData.claimedAmountTrackedByStrategyExact = BigInt.fromI32(0);
    userVestingData.initialized = false;
  }

  let token = Asset.load(airdrop.token);
  let decimals = token ? token.decimals : 18;
  let totalAmountBD = toDecimals(totalAmount, decimals);

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
