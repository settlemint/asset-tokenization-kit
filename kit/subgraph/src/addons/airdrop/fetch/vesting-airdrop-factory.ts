import { type Address } from "@graphprotocol/graph-ts";
import { VestingAirdrop, VestingStrategy } from "../../../../generated/schema";
import { VestingAirdrop as VestingAirdropTemplate } from "../../../../generated/templates";
import { VestingAirdrop as VestingAirdropContract } from "../../../../generated/templates/VestingAirdrop/VestingAirdrop";
import { getTokenDecimals } from "../../../utils/token-decimals";
import { fetchAirdrop } from "./airdrop";

export function fetchVestingAirdrop(id: Address): VestingAirdrop {
  let entity = VestingAirdrop.load(id);

  if (entity == null) {
    entity = new VestingAirdrop(id);

    const airdrop = fetchAirdrop(id);
    const tokenDecimals = getTokenDecimals(airdrop.token);

    const endpoint = VestingAirdropContract.bind(id);
    const vestingStrategy = endpoint.try_vestingStrategy();

    entity.save();
    VestingAirdropTemplate.create(id);
  }

  return entity;
}

export function fetchVestingStrategy(id: Address): VestingStrategy {
  let entity = VestingStrategy.load(id);

  if (entity == null) {
    entity = new VestingStrategy(id);
    // TODO: fetch typeId and strategy specific fields
    entity.save();
  }

  return entity;
}
