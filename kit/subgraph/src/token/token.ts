import {
  Approval,
  ComplianceAdded,
  ComplianceModuleAdded,
  ComplianceModuleRemoved,
  IdentityRegistryAdded,
  MintCompleted,
  ModuleParametersUpdated,
  RequiredClaimTopicsUpdated,
  TransferCompleted,
  UpdatedTokenInformation,
} from "../../generated/templates/Token/Token";
import { fetchEvent } from "../event/fetch/event";
import { updateYield } from "../fixed-yield-schedule/utils/fixed-yield-schedule-utils";
import {
  decreaseTokenBalanceValue,
  increaseTokenBalanceValue,
} from "../token-balance/utils/token-balance-utils";
import { fetchToken } from "./fetch/token";
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
}

export function handleComplianceModuleRemoved(
  event: ComplianceModuleRemoved
): void {
  fetchEvent(event, "ComplianceModuleRemoved");
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
  increaseTokenBalanceValue(token, event.params.to, event.params.amount);
}

export function handleModuleParametersUpdated(
  event: ModuleParametersUpdated
): void {
  fetchEvent(event, "ModuleParametersUpdated");
}

export function handleRequiredClaimTopicsUpdated(
  event: RequiredClaimTopicsUpdated
): void {
  fetchEvent(event, "RequiredClaimTopicsUpdated");
}

export function handleTransferCompleted(event: TransferCompleted): void {
  fetchEvent(event, "Transfer");
  const token = fetchToken(event.address);
  decreaseTokenBalanceValue(token, event.params.from, event.params.amount);
  increaseTokenBalanceValue(token, event.params.to, event.params.amount);
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
