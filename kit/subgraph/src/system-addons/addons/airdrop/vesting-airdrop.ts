import {
  BatchVestingInitialized,
  VestingInitialized,
  VestingStrategyUpdated,
} from "../../../generated/templates/VestingAirdrop/VestingAirdrop";
import { fetchEvent } from "../../event/fetch/event";
import { fetchAirdropAllocation } from "./fetch/airdrop-allocation";
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
  fetchAirdropAllocation(event.address, event.params.index);
}

export function handleBatchVestingInitialized(
  event: BatchVestingInitialized
): void {
  fetchEvent(event, "BatchVestingInitialized");

  const indices = event.params.indices;
  for (let i = 0; i < indices.length; i++) {
    fetchAirdropAllocation(event.address, indices[i]);
  }
}
