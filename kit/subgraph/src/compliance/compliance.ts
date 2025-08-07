import { store } from "@graphprotocol/graph-ts";
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

  let complianceModule = fetchComplianceModule(event.params.module);
  let complianceModuleConfig = fetchGlobalComplianceModuleConfig(
    event.address,
    event.params.module
  );
  let complianceModuleParameters = fetchComplianceModuleParameters(
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

  let complianceModuleConfig = fetchGlobalComplianceModuleConfig(
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

  let complianceModule = fetchComplianceModule(event.params.module);
  let complianceModuleConfig = fetchGlobalComplianceModuleConfig(
    event.address,
    event.params.module
  );
  let complianceModuleParameters = fetchComplianceModuleParameters(
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
    compliance.bypassList.push(event.params.account);
  }
  compliance.save();
}

export function handleAddressRemovedFromBypassList(
  event: AddressRemovedFromBypassListEvent
): void {
  fetchEvent(event, "AddressRemovedFromBypassList");

  const compliance = fetchCompliance(event.address);
  if (compliance.bypassList.includes(event.params.account)) {
    compliance.bypassList = compliance.bypassList.filter(
      (account) => !account.equals(event.params.account)
    );
  }
  compliance.save();
}
