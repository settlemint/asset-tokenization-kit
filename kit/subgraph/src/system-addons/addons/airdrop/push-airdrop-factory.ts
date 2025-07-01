import { ATKPushAirdropCreated } from "../../../../generated/templates/PushAirdropFactory/PushAirdropFactory";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchAirdrop } from "./fetch/airdrop";
import { fetchPushAirdrop } from "./fetch/push-airdrop";

export function handleATKPushAirdropCreated(
  event: ATKPushAirdropCreated
): void {
  fetchEvent(event, "ATKPushAirdropCreated");

  const pushAirdrop = fetchPushAirdrop(event.params.airdropAddress);
  const airdrop = fetchAirdrop(event.params.airdropAddress);

  airdrop.factory = event.address;
  airdrop.deployedInTransaction = event.transaction.hash;
  airdrop.pushAirdrop = pushAirdrop.id;
  airdrop.typeId = "ATKPushAirdrop";

  airdrop.save();
}
