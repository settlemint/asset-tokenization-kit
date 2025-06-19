import { type VestingStrategyUpdated } from "../../../generated/templates/VestingAirdrop/VestingAirdrop";
import { fetchEvent } from "../../event/fetch/event";
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
