import { Address, BigInt } from "@graphprotocol/graph-ts";
import { VestingAirdrop } from "../../../../generated/schema";
import { VestingAirdrop as VestingAirdropTemplate } from "../../../../generated/templates";
import { VestingAirdrop as VestingAirdropContract } from "../../../../generated/templates/VestingAirdrop/VestingAirdrop";
import { updateVestingAirdropStrategy } from "../utils/vesting-airdrop-utils";

export function fetchVestingAirdrop(id: Address): VestingAirdrop {
  let entity = VestingAirdrop.load(id);

  if (entity == null) {
    entity = new VestingAirdrop(id);
    const endpoint = VestingAirdropContract.bind(id);

    const initializationDeadline = endpoint.try_initializationDeadline();
    entity.initializationDeadline = initializationDeadline.reverted
      ? BigInt.zero()
      : initializationDeadline.value;

    updateVestingAirdropStrategy(entity);

    entity.save();
    VestingAirdropTemplate.create(id);
  }

  return entity;
}
