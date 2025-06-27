import { Address } from '@graphprotocol/graph-ts';
import { TokenYield } from '../../../../generated/schema';
import { Yield as YieldTemplate } from '../../../../generated/templates';

export function fetchYield(address: Address): TokenYield {
  let tokenYield = TokenYield.load(address);

  if (!tokenYield) {
    tokenYield = new TokenYield(address);
    tokenYield.schedule = Address.zero();
    tokenYield.save();
    YieldTemplate.create(address);
  }

  return tokenYield;
}
