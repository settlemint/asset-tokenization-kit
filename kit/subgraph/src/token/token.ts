import { store } from "@graphprotocol/graph-ts";
import {
  Approval,
  ComplianceAdded,
  ComplianceModuleAdded,
  ComplianceModuleRemoved,
  ERC20TokenRecovered,
  IdentityRegistryAdded,
  MintCompleted,
  ModuleParametersUpdated,
  TransferCompleted,
  UpdatedTokenInformation,
} from "../../generated/templates/Token/Token";
import { fetchComplianceModule } from "../compliance/fetch/compliance-module";
import {
  fetchComplianceModuleParameters,
  updateComplianceModuleParameters,
} from "../compliance/fetch/compliance-module-parameters";
import { fetchEvent } from "../event/fetch/event";
import { updateAccountStatsForBalanceChange } from "../stats/account-stats";
import {
  incrementSystemAssetActivity,
  SystemAssetActivity,
} from "../stats/system-stats";
import { trackTokenStats } from "../stats/token-stats";
import { incrementTokenTypeAssetActivity } from "../stats/token-type-stats";
import {
  decreaseTokenBalanceValue,
  increaseTokenBalanceValue,
} from "../token-balance/utils/token-balance-utils";
import { fetchToken } from "./fetch/token";
import { fetchTokenComplianceModuleConfig } from "./fetch/token-compliance-module-config";
import { handleMint } from "./utils/token-mint-utils";

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

  const complianceModule = fetchComplianceModule(event.params._module);
  const complianceModuleConfig = fetchTokenComplianceModuleConfig(
    event.address,
    event.params._module
  );
  const complianceModuleParameters = fetchComplianceModuleParameters(
    complianceModuleConfig.id
  );

  updateComplianceModuleParameters(
    complianceModuleParameters,
    complianceModule,
    event.params._params
  );
}

export function handleComplianceModuleRemoved(
  event: ComplianceModuleRemoved
): void {
  fetchEvent(event, "ComplianceModuleRemoved");

  const tokenComplianceModule = fetchTokenComplianceModuleConfig(
    event.address,
    event.params._module
  );

  store.remove(
    "TokenComplianceModuleConfig",
    tokenComplianceModule.id.toHexString()
  );
}

export function handleIdentityRegistryAdded(
  event: IdentityRegistryAdded
): void {
  fetchEvent(event, "IdentityRegistryAdded");
}

export function handleMintCompleted(event: MintCompleted): void {
  const eventEntry = fetchEvent(event, "MintCompleted");
  const token = fetchToken(event.address);
  handleMint(
    eventEntry,
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

  const complianceModule = fetchComplianceModule(event.params._module);
  const tokenComplianceModuleConfig = fetchTokenComplianceModuleConfig(
    event.address,
    event.params._module
  );
  const complianceModuleParameters = fetchComplianceModuleParameters(
    tokenComplianceModuleConfig.id
  );

  updateComplianceModuleParameters(
    complianceModuleParameters,
    complianceModule,
    event.params._params
  );
}

export function handleTransferCompleted(event: TransferCompleted): void {
  const eventEntry = fetchEvent(event, "TransferCompleted");
  const token = fetchToken(event.address);

  // Execute the transfer
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

  const amountExact = event.params.amount;

  // Update account stats for sender (negative delta)
  updateAccountStatsForBalanceChange(
    event.params.from,
    token,
    amountExact.neg()
  );

  // Update account stats for receiver (positive delta)
  updateAccountStatsForBalanceChange(event.params.to, token, amountExact);

  // Update token stats for transfer
  trackTokenStats(token, eventEntry);

  incrementSystemAssetActivity(token, SystemAssetActivity.TRANSFER);
  incrementTokenTypeAssetActivity(token, SystemAssetActivity.TRANSFER);
}

export function handleUpdatedTokenInformation(
  event: UpdatedTokenInformation
): void {
  fetchEvent(event, "UpdatedTokenInformation");
  const token = fetchToken(event.address);
  token.decimals = event.params._newDecimals;
  token.save();
}

export function handleERC20TokenRecovered(event: ERC20TokenRecovered): void {
  fetchEvent(event, "ERC20TokenRecovered");
}
