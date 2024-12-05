import { Address } from '@graphprotocol/graph-ts';
import { Bond } from '../../generated/schema';
import { Bond as BondContract } from '../../generated/templates/Bond/Bond';
import { fetchAccount } from './account';
import { fetchTotalSupply } from './balance';

export function fetchBond(address: Address): Bond {
  let bond = Bond.load(address);
  if (!bond) {
    let endpoint = BondContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();

    const account = fetchAccount(address);

    bond = new Bond(address);
    bond.name = name.reverted ? '' : name.value;
    bond.symbol = symbol.reverted ? '' : symbol.value;
    bond.decimals = decimals.reverted ? 18 : decimals.value;
    bond.totalSupply = fetchTotalSupply(address).id;
    bond.asAccount = bond.id;
    bond.save();

    account.asAsset = bond.id;
    account.save();
  }
  return bond;
}
