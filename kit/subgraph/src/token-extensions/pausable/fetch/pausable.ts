import type { Address } from '@graphprotocol/graph-ts';
import { TokenPausable } from '../../../../generated/schema';
import { Pausable as PausableTemplate } from '../../../../generated/templates';

export function fetchPausable(address: Address): TokenPausable {
  let pausable = TokenPausable.load(address);

  if (!pausable) {
    PausableTemplate.create(address);
    pausable = new TokenPausable(address);
    pausable.paused = false;
    pausable.save();
  }

  return pausable;
}
