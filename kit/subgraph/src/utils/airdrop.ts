import { BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  AirdropClaimIndex,
  AirdropRecipient,
  UserVestingData,
} from "../../generated/schema";
import { toDecimals } from "./decimals";

/**
 * Fetches or creates an AirdropRecipient entity for the given airdrop and account.
 * Handles the initialization of new recipients and tracks whether this is a new claimant.
 *
 * @param airdrop - The StandardAirdrop entity
 * @param claimantAccount - The Account entity for the claimant
 * @param event - The ethereum event for timestamp tracking
 * @returns Object containing the recipient entity and whether it's newly created
 */
export function fetchAirdropRecipient(
  airdrop: Bytes,
  claimantAccount: Bytes,
  event: ethereum.Event,
  totalClaimedByRecipient: BigDecimal,
  totalClaimedByRecipientExact: BigInt
): AirdropRecipient {
  const recipientId = airdrop.concat(claimantAccount);
  let recipient = AirdropRecipient.load(recipientId);

  if (!recipient) {
    recipient = new AirdropRecipient(recipientId);
    recipient.airdrop = airdrop;
    recipient.recipient = claimantAccount;
    recipient.firstClaimedTimestamp = event.block.timestamp;
    recipient.totalClaimedByRecipient = totalClaimedByRecipient;
    recipient.totalClaimedByRecipientExact = totalClaimedByRecipientExact;
  } else {
    recipient.totalClaimedByRecipient = recipient.totalClaimedByRecipient.plus(
      totalClaimedByRecipient
    );
    recipient.totalClaimedByRecipientExact =
      recipient.totalClaimedByRecipientExact.plus(totalClaimedByRecipientExact);
  }

  recipient.lastClaimedTimestamp = event.block.timestamp;
  recipient.save();

  return recipient;
}

/**
 * Fetches or creates an AirdropClaimIndex entity for the given airdrop, recipient, and index.
 * Handles the initialization and updating of claim index records.
 *
 * @param airdrop - The StandardAirdrop entity
 * @param recipient - The AirdropRecipient entity
 * @param index - The claim index from the batch claim
 * @param amount - The exact amount claimed for this index
 * @param decimals - The token decimals for amount conversion
 * @param event - The ethereum event for timestamp tracking
 * @returns The AirdropClaimIndex entity
 */
export function fetchAirdropClaimIndex(
  airdrop: Bytes,
  recipient: Bytes,
  index: BigInt,
  amount: BigInt,
  decimals: i32,
  event: ethereum.Event
): AirdropClaimIndex {
  const indexBytes = Bytes.fromByteArray(Bytes.fromBigInt(index));
  const claimIndexId = airdrop.concat(recipient).concat(indexBytes);
  let claimIndex = AirdropClaimIndex.load(claimIndexId);
  const amountBD = toDecimals(amount, decimals);

  if (!claimIndex) {
    claimIndex = new AirdropClaimIndex(claimIndexId);
    claimIndex.index = index;
    claimIndex.airdrop = airdrop;
    claimIndex.recipient = recipient;
  }

  claimIndex.amount = amountBD;
  claimIndex.amountExact = amount;
  claimIndex.timestamp = event.block.timestamp;
  claimIndex.save();

  return claimIndex;
}

/**
 * Fetches or creates a UserVestingData entity for the given strategy and user.
 * Handles the initialization of new vesting data and updates existing allocations.
 *
 * @param strategy - The vesting strategy entity ID as Bytes
 * @param user - The user account entity ID as Bytes
 * @param allocatedAmount - The exact allocated amount for this user
 * @param allocatedAmountBD - The allocated amount as BigDecimal
 * @param event - The ethereum event for timestamp tracking
 * @returns The UserVestingData entity
 */
export function fetchUserVestingData(
  strategy: Bytes,
  user: Bytes,
  allocatedAmount: BigInt,
  allocatedAmountBD: BigDecimal,
  event: ethereum.Event
): UserVestingData {
  const userVestingDataId = strategy.concat(user);
  let userVestingData = UserVestingData.load(userVestingDataId);

  if (!userVestingData) {
    userVestingData = new UserVestingData(userVestingDataId);
    userVestingData.strategy = strategy;
    userVestingData.user = user;
    // TODO: these values are not correct, not sure if they should be tracked here at all
    userVestingData.totalAmountAggregatedExact = allocatedAmount;
    userVestingData.totalAmountAggregated = allocatedAmountBD;
    userVestingData.claimedAmountTrackedByStrategyExact = BigInt.zero();
    userVestingData.claimedAmountTrackedByStrategy = BigDecimal.zero();
    userVestingData.vestingStart = event.block.timestamp;
  } else {
    userVestingData.totalAmountAggregatedExact =
      userVestingData.totalAmountAggregatedExact.plus(allocatedAmount);
    userVestingData.totalAmountAggregated =
      userVestingData.totalAmountAggregated.plus(allocatedAmountBD);
  }

  userVestingData.initialized = true;
  userVestingData.lastUpdated = event.block.timestamp;
  userVestingData.save();

  return userVestingData;
}
