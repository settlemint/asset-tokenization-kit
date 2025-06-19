import {
  TokensDistributed,
  type BatchTokensDistributed,
  type DistributionCapUpdated,
} from "../../../generated/templates/PushAirdrop/PushAirdrop";
import { fetchEvent } from "../../event/fetch/event";
import { setBigNumber } from "../../utils/bignumber";
import { getTokenDecimals } from "../../utils/token-decimals";
import { fetchAirdrop } from "./fetch/airdrop";
import { fetchAirdropAllocation } from "./fetch/airdrop-allocation";
import { fetchAirdropRecipient } from "./fetch/airdrop-recipient";
import { fetchPushAirdrop } from "./fetch/push-airdrop-factory";

export function handleTokensDistributed(event: TokensDistributed): void {
  fetchEvent(event, "TokensDistributed");
  const airdrop = fetchAirdrop(event.address);
  const tokenDecimals = getTokenDecimals(airdrop.token);
  setBigNumber(
    airdrop,
    "distributedTokens",
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
    event.params.index
  );
  airdropAllocation.recipient = airdropRecipient.id;
  setBigNumber(
    airdropAllocation,
    "amountTransferred",
    event.params.amount.plus(airdropAllocation.amountTransferredExact),
    tokenDecimals
  );
  airdropAllocation.save();
}

export function handleBatchTokensDistributed(
  event: BatchTokensDistributed
): void {
  fetchEvent(event, "BatchTokensDistributed");
  const airdrop = fetchAirdrop(event.address);
  const indices = event.params.indices;
  // TODO: event should emit total amounts for each index
  const amounts = event.params.totalAmount;
}

export function handleDistributionCapUpdated(
  event: DistributionCapUpdated
): void {
  fetchEvent(event, "DistributionCapUpdated");

  const pushAirdrop = fetchPushAirdrop(event.address);
  const airdrop = fetchAirdrop(event.address);
  const tokenDecimals = getTokenDecimals(airdrop.token);
  setBigNumber(
    pushAirdrop,
    "distributionCap",
    event.params.newCap,
    tokenDecimals
  );
  pushAirdrop.save();
}
