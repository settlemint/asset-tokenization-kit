import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";
import {
  FixedYieldScheduleFactory as FixedYieldScheduleFactoryTemplate,
  VaultFactory as VaultFactoryTemplate,
  XvPSettlementFactory as XvPSettlementFactoryTemplate,
} from "../../generated/templates";
import {
  AddonImplementationUpdated as AddonImplementationUpdatedEvent,
  SystemAddonRegistered as SystemAddonRegisteredEvent,
} from "../../generated/templates/SystemAddonRegistry/SystemAddonRegistry";
import { fetchEvent } from "../event/fetch/event";
import { fetchSystem } from "../system/fetch/system";
import { fetchSystemAddon } from "../system/fetch/system-addon";

export function handleAddonImplementationUpdated(
  event: AddonImplementationUpdatedEvent
): void {
  fetchEvent(event, "AddonImplementationUpdated");
}

export function handleSystemAddonRegistered(
  event: SystemAddonRegisteredEvent
): void {
  fetchEvent(event, "SystemAddonCreated");
  const systemAddon = fetchSystemAddon(event.params.proxyAddress);
  if (systemAddon.deployedInTransaction.equals(Bytes.empty())) {
    systemAddon.deployedInTransaction = event.transaction.hash;
  }
  systemAddon.name = event.params.name;
  systemAddon.typeId = event.params.typeId;
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKFixedYieldScheduleFactory"))
  ) {
    FixedYieldScheduleFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKXvPSettlementFactory"))
  ) {
    XvPSettlementFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKVaultFactory"))
  ) {
    VaultFactoryTemplate.create(event.params.proxyAddress);
  }
  systemAddon.system = fetchSystem(event.address).id;
  systemAddon.save();
}
