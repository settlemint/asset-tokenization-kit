import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AirdropAllocation } from "../../../../generated/schema";
import { setBigNumber } from "../../../utils/bignumber";
import { getTokenDecimals } from "../../../utils/token-decimals";
import { fetchAirdrop } from "./airdrop";

export function fetchAirdropAllocation(
  airdrop: Address,
  index: BigInt
): AirdropAllocation {
  const id = airdrop.concat(Bytes.fromBigInt(index));
  let entity = AirdropAllocation.load(id);

  if (entity == null) {
    entity = new AirdropAllocation(id);

    const airdropEntity = fetchAirdrop(airdrop);
    entity.airdrop = airdropEntity.id;
    const tokenDecimals = getTokenDecimals(airdropEntity.token);
    setBigNumber(entity, "amountTransferred", BigInt.zero(), tokenDecimals);
    entity.index = index;
    entity.initialized = true;
    entity.recipient = Address.zero();

    entity.save();
  }

  return entity;
}
