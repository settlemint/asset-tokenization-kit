import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AirdropRecipient } from "../../generated/schema";

export function fetchAirdropRecipient(
  airdropId: Bytes,
  recipientAccount: Bytes
): AirdropRecipient {
  let recipientId = airdropId.concat(recipientAccount).toHex();
  let recipient = AirdropRecipient.load(recipientId);

  if (!recipient) {
    recipient = new AirdropRecipient(recipientId);
    recipient.airdrop = airdropId;
    recipient.recipient = recipientAccount;
    recipient.totalClaimedByRecipientExact = BigInt.zero();
    recipient.totalClaimedByRecipient = BigDecimal.zero();
  }

  return recipient;
}
