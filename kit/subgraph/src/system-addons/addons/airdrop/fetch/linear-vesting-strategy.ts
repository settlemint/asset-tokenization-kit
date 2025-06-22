import { Address, BigInt } from "@graphprotocol/graph-ts";
import { LinearVestingStrategy } from "../../../../generated/schema";
import { LinearVestingStrategy as LinearVestingStrategyContract } from "../../../../generated/templates/VestingAirdrop/LinearVestingStrategy";

export function fetchLinearVestingStrategy(id: Address): LinearVestingStrategy {
  let entity = LinearVestingStrategy.load(id);

  if (entity == null) {
    entity = new LinearVestingStrategy(id);

    const endpoint = LinearVestingStrategyContract.bind(id);
    const vestingDuration = endpoint.try_vestingDuration();
    const cliffDuration = endpoint.try_cliffDuration();

    entity.vestingDuration = vestingDuration.reverted
      ? BigInt.zero()
      : vestingDuration.value;
    entity.cliffDuration = cliffDuration.reverted
      ? BigInt.zero()
      : cliffDuration.value;

    entity.save();
  }

  return entity;
}
