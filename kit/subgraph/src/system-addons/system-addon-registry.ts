import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";
import {
  FixedYieldScheduleFactory as FixedYieldScheduleFactoryTemplate,
  PushAirdropFactory as PushAirdropFactoryTemplate,
  TimeBoundAirdropFactory as TimeBoundAirdropFactoryTemplate,
  VaultFactory as VaultFactoryTemplate,
  VestingAirdropFactory as VestingAirdropFactoryTemplate,
  XvPSettlementFactory as XvPSettlementFactoryTemplate,
} from "../../generated/templates";
import {
  AddonImplementationUpdated as AddonImplementationUpdatedEvent,
  SystemAddonRegistered as SystemAddonRegisteredEvent,
} from "../../generated/templates/SystemAddonRegistry/SystemAddonRegistry";
import { fetchEvent } from "../event/fetch/event";
import { getDecodedTypeId } from "../type-identifier/type-identifier";
import { fetchSystemAddon } from "./fetch/system-addon";
import { setAccountContractName } from "../account/utils/account-contract-name";
import { fetchSystemAddonRegistry } from "./fetch/system-addon-registry";

export function handleAddonImplementationUpdated(
  event: AddonImplementationUpdatedEvent
): void {
  fetchEvent(event, "AddonImplementationUpdated");
}

export function handleSystemAddonRegistered(
  event: SystemAddonRegisteredEvent
): void {
  fetchEvent(event, "SystemAddonRegistered");
  const systemAddon = fetchSystemAddon(event.params.proxyAddress);
  if (systemAddon.deployedInTransaction.equals(Bytes.empty())) {
    systemAddon.deployedInTransaction = event.transaction.hash;
  }
  systemAddon.name = event.params.name;
  systemAddon.typeId = getDecodedTypeId(event.params.typeId);
  if (
    event.params.typeId.equals(
      crypto.keccak256(ByteArray.fromUTF8("ATKFixedYieldScheduleFactory"))
    )
  ) {
    FixedYieldScheduleFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId.equals(
      crypto.keccak256(ByteArray.fromUTF8("ATKXvPSettlementFactory"))
    )
  ) {
    XvPSettlementFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId.equals(
      crypto.keccak256(ByteArray.fromUTF8("ATKVaultFactory"))
    )
  ) {
    VaultFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId.equals(
      crypto.keccak256(ByteArray.fromUTF8("ATKPushAirdropFactory"))
    )
  ) {
    PushAirdropFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId.equals(
      crypto.keccak256(ByteArray.fromUTF8("ATKVestingAirdropFactory"))
    )
  ) {
    VestingAirdropFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId.equals(
      crypto.keccak256(ByteArray.fromUTF8("ATKTimeBoundAirdropFactory"))
    )
  ) {
    TimeBoundAirdropFactoryTemplate.create(event.params.proxyAddress);
  }

  systemAddon.systemAddonRegistry = fetchSystemAddonRegistry(event.address).id;
  systemAddon.save();

  // Persist a human-readable name on the underlying account
  setAccountContractName(event.params.proxyAddress, systemAddon.name);
}
