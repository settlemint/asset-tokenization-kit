import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Fund } from "../../../generated/schema";
import { Fund as FundContract } from "../../../generated/templates/Fund/Fund";
import { fetchAccount } from "../../utils/account";
import { AssetType } from "../../utils/enums";

export function fetchFund(address: Address): Fund {
  let fund = Fund.load(address);
  if (!fund) {
    let endpoint = FundContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let fundClass = endpoint.try_fundClass();
    let fundCategory = endpoint.try_fundCategory();
    let managementFeeBps = endpoint.try_managementFeeBps();
    let paused = endpoint.try_paused();

    const account = fetchAccount(address);

    fund = new Fund(address);
    fund.type = AssetType.fund;
    fund.asAccount = account.id;
    fund.name = name.reverted ? "" : name.value;
    fund.symbol = symbol.reverted ? "" : symbol.value;
    fund.decimals = decimals.reverted ? 18 : decimals.value;
    fund.totalSupplyExact = BigInt.zero();
    fund.totalSupply = BigDecimal.zero();
    fund.admins = [];
    fund.supplyManagers = [];
    fund.userManagers = [];
    fund.lastActivity = BigInt.zero();
    fund.creator = Address.zero();
    fund.totalMinted = BigDecimal.zero();
    fund.totalMintedExact = BigInt.zero();
    fund.totalBurned = BigDecimal.zero();
    fund.totalBurnedExact = BigInt.zero();
    fund.totalTransferred = BigDecimal.zero();
    fund.totalTransferredExact = BigInt.zero();
    fund.totalHolders = BigInt.zero();
    fund.concentration = BigDecimal.zero();

    // Fund-specific fields
    fund.fundClass = fundClass.reverted ? "" : fundClass.value;
    fund.fundCategory = fundCategory.reverted ? "" : fundCategory.value;
    fund.managementFeeBps = managementFeeBps.reverted
      ? 0
      : managementFeeBps.value;
    fund.paused = paused.reverted ? false : paused.value;
    fund.lastFeeCollection = BigInt.zero();
    fund.deployedOn = BigInt.zero();
    fund.save();

    account.asAsset = fund.id;
    account.save();
  }
  return fund;
}
