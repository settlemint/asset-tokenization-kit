import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Fund } from '../../generated/schema';
import { Fund as FundContract } from '../../generated/templates/Fund/Fund';
import { toDecimals } from '../utils/decimals';
import { fetchAccount } from './account';

export function fetchFund(address: Address): Fund {
  let fund = Fund.load(address);
  if (!fund) {
    let endpoint = FundContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let isin = endpoint.try_isin();
    let totalSupply = endpoint.try_totalSupply();
    let fundClass = endpoint.try_fundClass();
    let fundCategory = endpoint.try_fundCategory();
    let managementFeeBps = endpoint.try_managementFeeBps();
    let paused = endpoint.try_paused();

    const account = fetchAccount(address);

    fund = new Fund(address);
    fund.name = name.reverted ? '' : name.value;
    fund.symbol = symbol.reverted ? '' : symbol.value;
    fund.decimals = decimals.reverted ? 18 : decimals.value;
    fund.totalSupplyExact = totalSupply.reverted ? BigInt.zero() : totalSupply.value;
    fund.totalSupply = toDecimals(fund.totalSupplyExact, fund.decimals);
    fund.isin = isin.reverted ? '' : isin.value;
    fund.fundClass = fundClass.reverted ? '' : fundClass.value;
    fund.fundCategory = fundCategory.reverted ? '' : fundCategory.value;
    fund.managementFeeBps = managementFeeBps.reverted ? 0 : managementFeeBps.value;
    fund.paused = paused.reverted ? false : paused.value;
    fund.asAccount = fund.id;
    fund.lastFeeCollection = BigInt.fromI32(0);
    fund.save();

    account.asAsset = fund.id;
    account.save();
  }
  return fund;
}
