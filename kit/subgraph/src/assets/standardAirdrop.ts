import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  AirdropClaim,
  AirdropClaimIndex,
  AirdropRecipient,
  Asset,
  StandardAirdrop,
} from "../../generated/schema";
import {
  BatchClaimed,
  Claimed,
  TokensWithdrawn,
} from "../generated/templates/StandardAirdropTemplate/StandardAirdrop";

// Use fetchAccount and direct constants
import { fetchAccount } from "../fetch/account";
import { toDecimals } from "../utils/decimals";

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
  // NOTE: The Claimed event from AirdropBase doesn't include the index.
  // This makes tracking claimed status per index difficult from this event alone.
  // We might need to rely on BatchClaimed or modify AirdropBase event.
  // For now, we'll record the claim but cannot create AirdropClaimIndex precisely.

  log.info("Claimed event processed: Airdrop {}, Claimant {}, Amount {}", [
    airdropAddress.toHex(),
    claimantAddress.toHex(),
    amount.toString(),
  ]);

  let claimantAccount = fetchAccount(claimantAddress);
  let amountBD = toDecimals(amount, token.decimals);

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
  // PROBLEM: BatchClaimed event doesn't include individual amounts per index.
  // It's impossible to create accurate AirdropClaimIndex entities from this event alone.
  // The underlying contract needs modification or we accept incomplete indexing.
  // Assuming for now we only store the total and associate with the recipient.

  log.info(
    "BatchClaimed event processed: Airdrop {}, Claimant {}, TotalAmount {}, IndicesCount {}",
    [
      airdropAddress.toHex(),
      claimantAddress.toHex(),
      totalAmount.toString(),
      BigInt.fromI32(indices.length).toString(),
    ]
  );

  let claimantAccount = fetchAccount(claimantAddress);
  let totalAmountBD = toDecimals(totalAmount, token.decimals);

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

  // Create/Update AirdropClaimIndex entities (Inaccurately - without individual amounts)
  for (let i = 0; i < indices.length; i++) {
    let index = indices[i];
    let claimIndexId = airdrop.id.toHex() + "-" + index.toString();
    let claimIndex = AirdropClaimIndex.load(claimIndexId);
    if (!claimIndex) {
      claimIndex = new AirdropClaimIndex(claimIndexId);
      claimIndex.index = index;
      claimIndex.airdrop = airdrop.id;
      claimIndex.recipient = recipient.id; // Associated recipient
      claimIndex.amount = BigDecimal.fromString("0");
      claimIndex.amountExact = BigInt.fromI32(0);
      claimIndex.claim = claim.id;
      claimIndex.timestamp = event.block.timestamp;
      claimIndex.save();
    } else {
      // If index was somehow claimed before (maybe via single 'Claimed' if event changed?)
      // For now, we just ensure it exists and is linked to this claim
      claimIndex.claim = claim.id;
      claimIndex.timestamp = event.block.timestamp;
      claimIndex.save();
    }
  }
  // Link indices to the claim event (even though amounts are unknown)
  claim.save();

  // Update Airdrop totals
  airdrop.totalClaims = airdrop.totalClaims + 1; // Count as one batch claim event
  airdrop.totalClaimed = airdrop.totalClaimed.plus(totalAmountBD);
  airdrop.totalClaimedExact = airdrop.totalClaimedExact.plus(totalAmount);
  airdrop.save();
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
