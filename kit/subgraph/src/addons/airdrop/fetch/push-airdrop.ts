import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PushAirdrop } from "../../../../generated/schema";
import { PushAirdrop as PushAirdropTemplate } from "../../../../generated/templates";
import { PushAirdrop as PushAirdropContract } from "../../../../generated/templates/PushAirdrop/PushAirdrop";
import { setBigNumber } from "../../../utils/bignumber";
import { getTokenDecimals } from "../../../utils/token-decimals";
import { fetchAirdrop } from "./airdrop";

export function fetchPushAirdrop(id: Address): PushAirdrop {
  let entity = PushAirdrop.load(id);

  if (entity == null) {
    entity = new PushAirdrop(id);

    const airdrop = fetchAirdrop(id);
    const tokenAddress = Address.fromBytes(airdrop.token);
    const tokenDecimals = getTokenDecimals(tokenAddress);

    const endpoint = PushAirdropContract.bind(id);
    const distributionCap = endpoint.try_distributionCap();
    setBigNumber(
      entity,
      "distributionCap",
      distributionCap.reverted ? BigInt.zero() : distributionCap.value,
      tokenDecimals
    );

    entity.save();
    PushAirdropTemplate.create(id);
  }

  return entity;
}
