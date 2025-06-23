import {
  BatchVestingInitialized,
  VestingInitialized,
  VestingStrategyUpdated,
} from "../../../../generated/templates/VestingAirdrop/VestingAirdrop";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchAirdropAllocation } from "./fetch/airdrop-allocation";
import { fetchAirdropRecipient } from "./fetch/airdrop-recipient";
import { fetchVestingAirdrop } from "./fetch/vesting-airdrop";
import { updateVestingAirdropStrategy } from "./utils/vesting-airdrop-utils";

export function handleVestingStrategyUpdated(
  event: VestingStrategyUpdated
): void {
  fetchEvent(event, "VestingStrategyUpdated");

  const vestingAirdrop = fetchVestingAirdrop(event.address);
  updateVestingAirdropStrategy(vestingAirdrop);

  vestingAirdrop.save();
}

export function handleVestingInitialized(event: VestingInitialized): void {
  fetchEvent(event, "VestingInitialized");
  const airdropRecipient = fetchAirdropRecipient(
    event.address,
    event.params.account
  );

  fetchAirdropAllocation(event.address, event.params.index, airdropRecipient.id);
}

export function handleBatchVestingInitialized(
  event: BatchVestingInitialized
): void {
  fetchEvent(event, "BatchVestingInitialized");
  const airdropRecipient = fetchAirdropRecipient(
    event.address,
    event.params.account
  );

  const indices = event.params.indices;
  for (let i = 0; i < indices.length; i++) {
    fetchAirdropAllocation(event.address, indices[i], airdropRecipient.id);
  }
}
