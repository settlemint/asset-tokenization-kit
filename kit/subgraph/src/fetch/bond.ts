import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Bond } from '../../generated/schema';
import { Bond as BondContract } from '../../generated/templates/Bond/Bond';
import { toDecimals } from '../utils/decimals';
import { fetchAccount } from './account';

export function fetchBond(address: Address): Bond {
  let bond = Bond.load(address);
  if (!bond) {
    let endpoint = BondContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let totalSupply = endpoint.try_totalSupply();
    let maturityDate = endpoint.try_maturityDate();
    let isMatured = endpoint.try_isMatured();
    let paused = endpoint.try_paused();
    let faceValue = endpoint.try_faceValue();
    let underlyingAsset = endpoint.try_underlyingAsset();

    const account = fetchAccount(address);

    bond = new Bond(address);
    bond.name = name.reverted ? '' : name.value;
    bond.symbol = symbol.reverted ? '' : symbol.value;
    bond.decimals = decimals.reverted ? 18 : decimals.value;
    bond.totalSupplyExact = totalSupply.reverted ? BigInt.zero() : totalSupply.value;
    bond.totalSupply = toDecimals(bond.totalSupplyExact);
    bond.maturityDate = maturityDate.reverted ? BigInt.zero() : maturityDate.value;
    bond.isMatured = maturityDate.reverted ? false : isMatured.value;
    bond.paused = paused.reverted ? false : paused.value;
    bond.faceValue = faceValue.reverted ? BigInt.zero() : faceValue.value;
    bond.underlyingAsset = underlyingAsset.reverted ? Address.zero() : underlyingAsset.value;
    bond.asAccount = bond.id;
    bond.save();

    account.asAsset = bond.id;
    account.save();
  }
  return bond;
}
