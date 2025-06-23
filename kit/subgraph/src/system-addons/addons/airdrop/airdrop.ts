import { Address } from "@graphprotocol/graph-ts";
import {
  AirdropBatchTokensTransferred,
  AirdropTokensTransferred,
} from "../../../../generated/templates/PushAirdrop/PushAirdrop";
import { fetchEvent } from "../../../event/fetch/event";
import { setBigNumber } from "../../../utils/bignumber";
import { getTokenDecimals } from "../../../utils/token-decimals";
import { fetchAirdrop } from "./fetch/airdrop";
import { fetchAirdropAllocation } from "./fetch/airdrop-allocation";
import { fetchAirdropRecipient } from "./fetch/airdrop-recipient";

export function handleAirdropTokensTransferred(
  event: AirdropTokensTransferred
): void {
  fetchEvent(event, "AirdropTokensTransferred");
  const airdrop = fetchAirdrop(event.address);
  const tokenAddress = Address.fromBytes(airdrop.token);
  const tokenDecimals = getTokenDecimals(tokenAddress);
  setBigNumber(
    airdrop,
    "amountTransferred",
    event.params.amount.plus(airdrop.amountTransferredExact),
    tokenDecimals
  );
  airdrop.save();

  const airdropRecipient = fetchAirdropRecipient(
    event.address,
    event.params.recipient
  );
  setBigNumber(
    airdropRecipient,
    "amountTransferred",
    event.params.amount.plus(airdropRecipient.amountTransferredExact),
    tokenDecimals
  );
  airdropRecipient.save();

  const airdropAllocation = fetchAirdropAllocation(
    event.address,
    event.params.index,
    airdropRecipient.id
  );
  setBigNumber(
    airdropAllocation,
    "amountTransferred",
    event.params.amount.plus(airdropAllocation.amountTransferredExact),
    tokenDecimals
  );
  airdropAllocation.save();
}

export function handleAirdropBatchTokensTransferred(
  event: AirdropBatchTokensTransferred
): void {
  fetchEvent(event, "AirdropBatchTokensTransferred");
  const airdrop = fetchAirdrop(event.address);
  const tokenAddress = Address.fromBytes(airdrop.token);
  const tokenDecimals = getTokenDecimals(tokenAddress);
  const indices = event.params.indices;
  for (let i = 0; i < indices.length; i++) {
    const index = indices.at(i);
    const amount = event.params.amounts.at(i);
    const recipient = event.params.recipients.at(i);

    const airdropRecipient = fetchAirdropRecipient(airdrop.id, recipient);
    setBigNumber(
      airdropRecipient,
      "amountTransferred",
      amount.plus(airdropRecipient.amountTransferredExact),
      tokenDecimals
    );
    airdropRecipient.save();

    const airdropAllocation = fetchAirdropAllocation(
      airdrop.id,
      index,
      airdropRecipient.id
    );
    setBigNumber(
      airdropAllocation,
      "amountTransferred",
      amount.plus(airdropAllocation.amountTransferredExact),
      tokenDecimals
    );
    airdropAllocation.save();
  }
}
