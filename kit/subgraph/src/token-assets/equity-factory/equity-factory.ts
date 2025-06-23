import { Bytes } from "@graphprotocol/graph-ts";
import { EquityCreated as EquityCreatedEvent } from "../../../generated/templates/EquityFactory/EquityFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { fetchTopicScheme } from "../../topic-scheme-registry/fetch/topic-scheme";

export function handleEquityCreated(event: EquityCreatedEvent): void {
  fetchEvent(event, "EquityCreated");
  const token = fetchToken(event.params.tokenAddress);
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  const requiredClaimTopics = new Array<Bytes>();
  for (let i = 0; i < event.params.requiredClaimTopics.length; i++) {
    const topicSchema = fetchTopicScheme(event.params.requiredClaimTopics[i]);
    requiredClaimTopics.push(topicSchema.id);
  }
  token.requiredClaimTopics = requiredClaimTopics;
  token.save();
}
