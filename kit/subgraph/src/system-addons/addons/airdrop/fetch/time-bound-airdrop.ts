import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TimeBoundAirdrop } from "../../../../../generated/schema";
import { TimeBoundAirdrop as TimeBoundAirdropContract } from "../../../../../generated/templates/TimeBoundAirdropFactory/TimeBoundAirdrop";

export function fetchTimeBoundAirdrop(id: Address): TimeBoundAirdrop {
  let entity = TimeBoundAirdrop.load(id);

  if (entity == null) {
    entity = new TimeBoundAirdrop(id);

    const endpoint = TimeBoundAirdropContract.bind(id);

    const startTime = endpoint.try_startTime();
    const endTime = endpoint.try_endTime();

    entity.startTime = startTime.reverted ? BigInt.zero() : startTime.value;
    entity.endTime = endTime.reverted ? BigInt.zero() : endTime.value;

    entity.save();
  }

  return entity;
}
