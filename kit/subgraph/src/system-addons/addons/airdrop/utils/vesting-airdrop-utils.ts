import {
  Address,
  ByteArray,
  Bytes,
  crypto,
  log,
} from "@graphprotocol/graph-ts";
import { VestingAirdrop } from "../../../../../generated/schema";
import { VestingAirdrop as VestingAirdropContract } from "../../../../../generated/templates/VestingAirdrop/VestingAirdrop";
import { VestingStrategy as VestingStrategyContract } from "../../../../../generated/templates/VestingAirdrop/VestingStrategy";
import { fetchLinearVestingStrategy } from "../fetch/linear-vesting-strategy";

export function updateVestingAirdropStrategy(entity: VestingAirdrop): void {
  const contract = VestingAirdropContract.bind(Address.fromBytes(entity.id));

  entity.strategyId = Bytes.empty();

  const strategyAddressResult = contract.try_vestingStrategy();
  if (strategyAddressResult.reverted) {
    log.warning(
      "VestingAirdropContract: vestingStrategy reverted for vesting airdrop {}",
      [entity.id.toHexString()]
    );
    return;
  }

  const strategyAddress = strategyAddressResult.value;
  const strategyContract = VestingStrategyContract.bind(strategyAddress);
  const typeIdResult = strategyContract.try_typeId();
  if (typeIdResult.reverted) {
    log.warning("VestingStrategyContract: typeId reverted for strategy {}", [
      strategyAddress.toHexString(),
    ]);
    return;
  }

  const typeId = typeIdResult.value;
  entity.strategyId = typeId;

  if (
    typeId.equals(
      crypto.keccak256(ByteArray.fromUTF8("ATKLinearVestingStrategy"))
    )
  ) {
    const linearVestingStrategy = fetchLinearVestingStrategy(strategyAddress);
    entity.linearVestingStrategy = linearVestingStrategy.id;
  } else {
    log.warning("TypeId {} does not match any strategy for airdrop {}", [
      typeId.toHexString(),
      entity.id.toHexString(),
    ]);
  }

  entity.save();
}
