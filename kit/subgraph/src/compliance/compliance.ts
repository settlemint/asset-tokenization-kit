import { Address, Bytes, store } from "@graphprotocol/graph-ts";
import {
  AddressAddedToBypassList as AddressAddedToBypassListEvent,
  AddressRemovedFromBypassList as AddressRemovedFromBypassListEvent,
  GlobalComplianceModuleAdded as GlobalComplianceModuleAddedEvent,
  GlobalComplianceModuleParametersUpdated as GlobalComplianceModuleParametersUpdatedEvent,
  GlobalComplianceModuleRemoved as GlobalComplianceModuleRemovedEvent,
} from "../../generated/templates/Compliance/Compliance";
import { fetchEvent } from "../event/fetch/event";
import { fetchCompliance } from "./fetch/compliance";
import { fetchComplianceModule } from "./fetch/compliance-module";
import {
  fetchComplianceModuleParameters,
  updateComplianceModuleParameters,
} from "./fetch/compliance-module-parameters";
import { fetchGlobalComplianceModuleConfig } from "./fetch/global-compliance-module-config";

export function handleGlobalComplianceModuleAdded(
  event: GlobalComplianceModuleAddedEvent
): void {
  fetchEvent(event, "GlobalComplianceModuleAdded");

  const compliance = fetchCompliance(event.address);
  const complianceModule = fetchComplianceModule(
    Address.fromBytes(compliance.system),
    event.params.module
  );
  const complianceModuleConfig = fetchGlobalComplianceModuleConfig(
    event.address,
    event.params.module
  );
  const complianceModuleParameters = fetchComplianceModuleParameters(
    complianceModuleConfig.id
  );

  updateComplianceModuleParameters(
    complianceModuleParameters,
    complianceModule,
    event.params.params
  );
}

export function handleGlobalComplianceModuleRemoved(
  event: GlobalComplianceModuleRemovedEvent
): void {
  fetchEvent(event, "GlobalComplianceModuleRemoved");

  const complianceModuleConfig = fetchGlobalComplianceModuleConfig(
    event.address,
    event.params.module
  );
  store.remove(
    "GlobalComplianceModuleConfig",
    complianceModuleConfig.id.toHexString()
  );
}

export function handleGlobalComplianceModuleParametersUpdated(
  event: GlobalComplianceModuleParametersUpdatedEvent
): void {
  fetchEvent(event, "GlobalComplianceModuleParametersUpdated");

  const compliance = fetchCompliance(event.address);
  const complianceModule = fetchComplianceModule(
    Address.fromBytes(compliance.system),
    event.params.module
  );
  const complianceModuleConfig = fetchGlobalComplianceModuleConfig(
    event.address,
    event.params.module
  );
  const complianceModuleParameters = fetchComplianceModuleParameters(
    complianceModuleConfig.id
  );

  updateComplianceModuleParameters(
    complianceModuleParameters,
    complianceModule,
    event.params.params
  );
}

export function handleAddressAddedToBypassList(
  event: AddressAddedToBypassListEvent
): void {
  fetchEvent(event, "AddressAddedToBypassList");

  const compliance = fetchCompliance(event.address);
  if (!compliance.bypassList.includes(event.params.account)) {
    const newBypassList = compliance.bypassList.concat([event.params.account]);
    compliance.bypassList = newBypassList;
  }
  compliance.save();
}

export function handleAddressRemovedFromBypassList(
  event: AddressRemovedFromBypassListEvent
): void {
  fetchEvent(event, "AddressRemovedFromBypassList");

  const compliance = fetchCompliance(event.address);
  if (compliance.bypassList.includes(event.params.account)) {
    const newBypassList: Bytes[] = [];
    for (let i = 0; i < compliance.bypassList.length; i++) {
      if (!compliance.bypassList[i].equals(event.params.account)) {
        newBypassList.push(compliance.bypassList[i]);
      }
    }
    compliance.bypassList = newBypassList;
  }
  compliance.save();
}
