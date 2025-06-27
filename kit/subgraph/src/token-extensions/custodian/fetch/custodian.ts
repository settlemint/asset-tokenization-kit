import type { Address } from '@graphprotocol/graph-ts';
import { Custodian as CustodianTemplate } from '../../../../generated/templates';

export function fetchCustodian(address: Address): void {
  CustodianTemplate.create(address);
}
