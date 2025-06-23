import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Airdrop } from "../../../../../generated/schema";
import { Airdrop as AirdropContract } from "../../../../../generated/templates/Airdrop/Airdrop";
import { setBigNumber } from "../../../../utils/bignumber";
import { getTokenDecimals } from "../../../../utils/token-decimals";

export function fetchAirdrop(id: Bytes): Airdrop {
  let entity = Airdrop.load(id);

  if (entity == null) {
    entity = new Airdrop(id);
    const address = Address.fromBytes(id);
    const endpoint = AirdropContract.bind(address);
    const name = endpoint.try_name();
    const token = endpoint.try_token();
    const merkleRoot = endpoint.try_merkleRoot();

    entity.name = name.reverted ? "unknown" : name.value;
    entity.token = token.reverted ? Address.zero() : token.value;
    entity.merkleRoot = merkleRoot.reverted ? Bytes.empty() : merkleRoot.value;
    entity.typeId = Bytes.fromHexString("0x00");
    entity.deployedInTransaction = Bytes.empty();
    entity.factory = Address.zero();

    const tokenAddress = Address.fromBytes(entity.token);
    const tokenDecimals = getTokenDecimals(tokenAddress);
    setBigNumber(entity, "amountTransferred", BigInt.zero(), tokenDecimals);

    entity.save();
  }

  return entity;
}
