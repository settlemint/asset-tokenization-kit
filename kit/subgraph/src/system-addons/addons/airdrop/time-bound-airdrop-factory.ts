import { ATKTimeBoundAirdropCreated } from "../../../../generated/templates/TimeBoundAirdropFactory/TimeBoundAirdropFactory";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchAirdrop } from "./fetch/airdrop";
import { fetchTimeBoundAirdrop } from "./fetch/time-bound-airdrop";

export function handleATKTimeBoundAirdropCreated(
  event: ATKTimeBoundAirdropCreated
): void {
  fetchEvent(event, "ATKTimeBoundAirdropCreated");

  const timeBoundAirdrop = fetchTimeBoundAirdrop(event.params.airdropAddress);
  const airdrop = fetchAirdrop(event.params.airdropAddress);

  airdrop.factory = event.address;
  airdrop.deployedInTransaction = event.transaction.hash;
  airdrop.timeBoundAirdrop = timeBoundAirdrop.id;
  airdrop.typeId = "ATKTimeBoundAirdrop";

  airdrop.save();
}
