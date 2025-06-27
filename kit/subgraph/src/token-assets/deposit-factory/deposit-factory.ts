import type { Bytes } from '@graphprotocol/graph-ts';
import type { DepositCreated as DepositCreatedEvent } from '../../../generated/templates/DepositFactory/DepositFactory';
import { fetchEvent } from '../../event/fetch/event';
import { fetchToken } from '../../token/fetch/token';
import { fetchTopicScheme } from '../../topic-scheme-registry/fetch/topic-scheme';

export function handleDepositCreated(event: DepositCreatedEvent): void {
  fetchEvent(event, 'DepositCreated');
  const token = fetchToken(event.params.tokenAddress);
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  const requiredClaimTopics: Bytes[] = [];
  for (let i = 0; i < event.params.requiredClaimTopics.length; i++) {
    const topicSchema = fetchTopicScheme(event.params.requiredClaimTopics[i]);
    requiredClaimTopics.push(topicSchema.id);
  }
  token.requiredClaimTopics = requiredClaimTopics;
  token.save();
}
