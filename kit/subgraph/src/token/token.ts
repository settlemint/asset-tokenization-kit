import { BigInt, store } from "@graphprotocol/graph-ts";
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
import { fetchAccount } from "../account/fetch/account";
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
import { updateAccountStatsForBalanceChange } from "../stats/account-stats";
import { updateSystemStatsForSupplyChange } from "../stats/system-stats";
import { fetchTokenBalance } from "../token-balance/fetch/token-balance";
import {
  decreaseTokenBalanceValue,
  increaseTokenBalanceValue,
} from "../token-balance/utils/token-balance-utils";
import { updateYield } from "../token-extensions/fixed-yield-schedule/utils/fixed-yield-schedule-utils";
import { toBigDecimal } from "../utils/token-decimals";
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
  fetchEvent(event, "MintCompleted");
  const token = fetchToken(event.address);
  increaseTokenSupply(token, event.params.amount);

  // Check if this creates a new balance
  const account = fetchAccount(event.params.to);
  const balanceBefore = fetchTokenBalance(token, account);
  const hadBalanceBefore = balanceBefore.valueExact.gt(BigInt.zero()) ? 1 : 0;

  increaseTokenBalanceValue(
    token,
    event.params.to,
    event.params.amount,
    event.block.timestamp
  );

  // Check if balance count changed (new balance created)
  const hasBalanceAfter = 1; // After mint, always has balance

  // Update system stats
  const supplyDelta = toBigDecimal(event.params.amount, token.decimals);
  updateSystemStatsForSupplyChange(token, supplyDelta, event.block.timestamp);

  // Update account stats
  updateAccountStatsForBalanceChange(
    event.params.to,
    token,
    supplyDelta,
    hadBalanceBefore,
    hasBalanceAfter,
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

  // Get balance states before the transfer
  const fromAccount = fetchAccount(event.params.from);
  const toAccount = fetchAccount(event.params.to);
  const fromBalanceBefore = fetchTokenBalance(token, fromAccount);
  const toBalanceBefore = fetchTokenBalance(token, toAccount);

  const fromHadBalanceBefore = fromBalanceBefore.valueExact.gt(BigInt.zero())
    ? 1
    : 0;
  const toHadBalanceBefore = toBalanceBefore.valueExact.gt(BigInt.zero())
    ? 1
    : 0;

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

  // Get balance states after the transfer
  const fromBalanceAfter = fetchTokenBalance(token, fromAccount);
  const fromHasBalanceAfter = fromBalanceAfter.valueExact.gt(BigInt.zero())
    ? 1
    : 0;
  const toHasBalanceAfter = 1; // After receiving transfer, always has balance

  // Calculate amount delta
  const amountDelta = toBigDecimal(event.params.amount, token.decimals);

  // Update account stats for sender (negative delta)
  updateAccountStatsForBalanceChange(
    event.params.from,
    token,
    amountDelta.neg(),
    fromHadBalanceBefore,
    fromHasBalanceAfter,
    event.block.timestamp
  );

  // Update account stats for receiver (positive delta)
  updateAccountStatsForBalanceChange(
    event.params.to,
    token,
    amountDelta,
    toHadBalanceBefore,
    toHasBalanceAfter,
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
