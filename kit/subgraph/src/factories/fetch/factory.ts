import { Address } from '@graphprotocol/graph-ts';
import { Factory } from '../../../generated/schema';
import { fetchAccount } from '../../fetch/account';

export function fetchFactory(address: Address, type: string): Factory {
  let factory = Factory.load(address);

  if (!factory) {
    const account = fetchAccount(address);

    factory = new Factory(address);
    factory.type = type;
    factory.asAccount = account.id;
    factory.save();

    account.save();
  }
  return factory;
}
