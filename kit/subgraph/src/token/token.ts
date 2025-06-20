import { store } from "@graphprotocol/graph-ts";
import {
  Approval,
  ComplianceAdded,
  ComplianceModuleAdded,
  ComplianceModuleRemoved,
  IdentityRegistryAdded,
  MintCompleted,
  ModuleParametersUpdated,
  TransferCompleted,
  UpdatedTokenInformation,
} from "../../generated/templates/Token/Token";
import { fetchComplianceModule } from "../compliance/fetch/compliance-module";
import {
  decodeAddressListParams,
  isAddressListComplianceModule,
} from "../compliance/modules/address-list-compliance-module";
import {
  decodeCountryListParams,
  isCountryListComplianceModule,
} from "../compliance/modules/country-list-compliance-module";
import { fetchEvent } from "../event/fetch/event";
import {
  decreaseTokenBalanceValue,
  increaseTokenBalanceValue,
} from "../token-balance/utils/token-balance-utils";
import { updateYield } from "../token-extensions/fixed-yield-schedule/utils/fixed-yield-schedule-utils";
import { fetchToken } from "./fetch/token";
import { fetchTokenComplianceModule } from "./fetch/token-compliance-module";
import { increaseTokenSupply } from "./utils/token-utils";

export function handleApproval(event: Approval): void {
  fetchEvent(event, "Approval");
}

export function handleComplianceAdded(event: ComplianceAdded): void {
  fetchEvent(event, "ComplianceAdded");
}

export function handleComplianceModuleAdded(
  event: ComplianceModuleAdded
): void {
  fetchEvent(event, "ComplianceModuleAdded");

  const tokenComplianceModule = fetchTokenComplianceModule(
    event.address,
    event.params._module
  );

  const complianceModule = fetchComplianceModule(event.params._module);
  tokenComplianceModule.encodedParams = event.params._params;

  if (isAddressListComplianceModule(complianceModule.typeId)) {
    tokenComplianceModule.addresses = decodeAddressListParams(
      event.params._params
    );
  }
  if (isCountryListComplianceModule(complianceModule.typeId)) {
    tokenComplianceModule.countries = decodeCountryListParams(
      event.params._params
    );
  }

  tokenComplianceModule.save();
}

export function handleComplianceModuleRemoved(
  event: ComplianceModuleRemoved
): void {
  fetchEvent(event, "ComplianceModuleRemoved");

  const tokenComplianceModule = fetchTokenComplianceModule(
    event.address,
    event.params._module
  );

  store.remove("TokenComplianceModule", tokenComplianceModule.id.toHexString());
}

export function handleIdentityRegistryAdded(
  event: IdentityRegistryAdded
): void {
  fetchEvent(event, "IdentityRegistryAdded");
}

export function handleMintCompleted(event: MintCompleted): void {
  fetchEvent(event, "Mint");
  const token = fetchToken(event.address);
  increaseTokenSupply(token, event.params.amount);
  increaseTokenBalanceValue(
    token,
    event.params.to,
    event.params.amount,
    event.block.timestamp
  );
}

export function handleModuleParametersUpdated(
  event: ModuleParametersUpdated
): void {
  fetchEvent(event, "ModuleParametersUpdated");

  const tokenComplianceModule = fetchTokenComplianceModule(
    event.address,
    event.params._module
  );

  const complianceModule = fetchComplianceModule(event.params._module);
  tokenComplianceModule.encodedParams = event.params._params;

  if (isAddressListComplianceModule(complianceModule.typeId)) {
    tokenComplianceModule.addresses = decodeAddressListParams(
      event.params._params
    );
  }
  if (isCountryListComplianceModule(complianceModule.typeId)) {
    tokenComplianceModule.countries = decodeCountryListParams(
      event.params._params
    );
  }

  tokenComplianceModule.save();
}

export function handleTransferCompleted(event: TransferCompleted): void {
  fetchEvent(event, "Transfer");
  const token = fetchToken(event.address);
  decreaseTokenBalanceValue(
    token,
    event.params.from,
    event.params.amount,
    event.block.timestamp
  );
  increaseTokenBalanceValue(
    token,
    event.params.to,
    event.params.amount,
    event.block.timestamp
  );
  if (token.yield_) {
    updateYield(token);
  }
}

export function handleUpdatedTokenInformation(
  event: UpdatedTokenInformation
): void {
  fetchEvent(event, "UpdatedTokenInformation");
  const token = fetchToken(event.address);
  token.decimals = event.params._newDecimals;
  token.save();
}
