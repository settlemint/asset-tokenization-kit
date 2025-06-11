import { BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { AirdropClaimIndex, AirdropRecipient } from "../../generated/schema";
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
 * @param amountExact - The exact amount claimed for this index
 * @param decimals - The token decimals for amount conversion
 * @param event - The ethereum event for timestamp tracking
 * @returns The AirdropClaimIndex entity
 */
export function fetchAirdropClaimIndex(
  airdrop: Bytes,
  recipient: Bytes,
  index: BigInt,
  amountExact: BigInt,
  decimals: i32,
  event: ethereum.Event
): AirdropClaimIndex {
  const indexBytes = Bytes.fromByteArray(Bytes.fromBigInt(index));
  const claimIndexId = airdrop.concat(recipient).concat(indexBytes);

  let claimIndex = AirdropClaimIndex.load(claimIndexId);

  const amount = toDecimals(amountExact, decimals);

  if (!claimIndex) {
    claimIndex = new AirdropClaimIndex(claimIndexId);
    claimIndex.index = index;
    claimIndex.airdrop = airdrop;
    claimIndex.recipient = recipient;
    claimIndex.amount = amount;
    claimIndex.amountExact = amountExact;
    claimIndex.initialized = event.block.timestamp;
  } else {
    claimIndex.amount = claimIndex.amount.plus(amount);
    claimIndex.amountExact = claimIndex.amountExact.plus(amountExact);
  }

  claimIndex.timestamp = event.block.timestamp;
  claimIndex.save();

  return claimIndex;
}
