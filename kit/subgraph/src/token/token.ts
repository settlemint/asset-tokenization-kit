import { Address, store } from "@graphprotocol/graph-ts";
import {
  Approval,
  ComplianceAdded,
  ComplianceModuleAdded,
  ComplianceModuleRemoved,
  ERC20TokenRecovered,
  IdentityRegistryAdded,
  ModuleParametersUpdated,
  Transfer,
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
  updateSystemStatsForSupplyChange,
} from "../stats/system-stats";
import { trackTokenCollateralStats } from "../stats/token-collateral-stats";
import { trackTokenStats } from "../stats/token-stats";
import {
  incrementTokenTypeAssetActivity,
  updateTokenTypeStatsForSupplyChange,
} from "../stats/token-type-stats";
import { updateTotalDenominationAssetNeeded } from "../token-assets/bond/utils/bond-utils";
import {
  decreaseTokenBalanceValue,
  increaseTokenBalanceValue,
} from "../token-balance/utils/token-balance-utils";
import { fetchCollateral } from "../token-extensions/collateral/fetch/collateral";
import { updateYield } from "../token-extensions/fixed-yield-schedule/utils/fixed-yield-schedule-utils";
import { toBigDecimal } from "../utils/token-decimals";
import { fetchToken } from "./fetch/token";
import { fetchTokenComplianceModuleConfig } from "./fetch/token-compliance-module-config";
import { decreaseTokenSupply, increaseTokenSupply } from "./utils/token-utils";

export function handleApproval(event: Approval): void {
  fetchEvent(event, "Approval");
}

/**
 * We handle the ERC20 transfer event and convert it to a MintCompleted or TransferCompleted event
 * Some contracts do a direct ERC20 mint/burn or transfer under the hood, so we need to handle this event to ensure we handle everything correctly
 * @param event - The transfer event
 */
export function handleTransfer(event: Transfer): void {
  const token = fetchToken(event.address);
  if (event.params.to == Address.zero()) {
    // It is a burn
    handleBurnCompleted(event);
  } else if (event.params.from == Address.zero()) {
    // It is a mint
    handleMintCompleted(event);
  } else {
    // It is a transfer
    handleTransferCompleted(event);
  }
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

function handleMintCompleted(event: Transfer): void {
  const eventEntry = fetchEvent(event, "MintCompleted");
  const token = fetchToken(event.address);
  increaseTokenSupply(token, event.params.value);

  // Update token balance
  increaseTokenBalanceValue(
    token,
    event.params.to,
    event.params.value,
    event.block.timestamp
  );

  const amountDeltaExact = event.params.value;
  const amountDelta = toBigDecimal(event.params.value, token.decimals);

  // Update system stats
  const totalSystemValueInBaseCurrency = updateSystemStatsForSupplyChange(
    token,
    amountDelta
  );

  // Update token type stats
  updateTokenTypeStatsForSupplyChange(
    totalSystemValueInBaseCurrency,
    token,
    amountDelta
  );

  // Update account stats
  updateAccountStatsForBalanceChange(event.params.to, token, amountDeltaExact);

  // Update token stats
  trackTokenStats(token, eventEntry);

  // Update token collateral stats
  if (token.collateral) {
    const collateral = fetchCollateral(event.address);
    trackTokenCollateralStats(token, collateral);
  }

  // Update total denomination asset needed on maturity if this is a bond token
  if (token.bond) {
    updateTotalDenominationAssetNeeded(token);
  }

  incrementSystemAssetActivity(token, SystemAssetActivity.MINT);
  incrementTokenTypeAssetActivity(token, SystemAssetActivity.MINT);
}

function handleTransferCompleted(event: Transfer): void {
  const eventEntry = fetchEvent(event, "TransferCompleted");
  const token = fetchToken(event.address);

  // Execute the transfer
  decreaseTokenBalanceValue(
    token,
    event.params.from,
    event.params.value,
    event.block.timestamp
  );
  increaseTokenBalanceValue(
    token,
    event.params.to,
    event.params.value,
    event.block.timestamp
  );

  const amountExact = event.params.value;

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

  if (token.yield_) {
    updateYield(token);
  }
}

function handleBurnCompleted(event: Transfer): void {
  const eventEntry = fetchEvent(event, "BurnCompleted");
  const token = fetchToken(event.address);

  // Execute the burn
  decreaseTokenSupply(token, event.params.value);
  decreaseTokenBalanceValue(
    token,
    event.params.from,
    event.params.value,
    event.block.timestamp
  );

  const amountDelta = toBigDecimal(event.params.value, token.decimals).neg();
  const amountDeltaExact = event.params.value.neg();

  // Update system stats (negative delta for burn)
  const totalSystemValueInBaseCurrency = updateSystemStatsForSupplyChange(
    token,
    amountDelta
  );

  // Update token type stats (negative delta for burn)
  updateTokenTypeStatsForSupplyChange(
    totalSystemValueInBaseCurrency,
    token,
    amountDelta
  );

  // Update account stats (negative delta for burn)
  updateAccountStatsForBalanceChange(
    event.params.from,
    token,
    amountDeltaExact
  );

  // Update token stats
  trackTokenStats(token, eventEntry);

  // Update token collateral stats
  if (token.collateral) {
    const collateral = fetchCollateral(event.address);
    trackTokenCollateralStats(token, collateral);
  }

  // Update total denomination asset needed on maturity if this is a bond token
  if (token.bond) {
    updateTotalDenominationAssetNeeded(token);
  }

  incrementSystemAssetActivity(token, SystemAssetActivity.BURN);
  incrementTokenTypeAssetActivity(token, SystemAssetActivity.BURN);
}
