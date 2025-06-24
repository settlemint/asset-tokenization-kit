import { Bytes } from "@graphprotocol/graph-ts";
import { StableCoinCreated as StableCoinCreatedEvent } from "../../../generated/templates/StableCoinFactory/StableCoinFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { fetchTopicScheme } from "../../topic-scheme-registry/fetch/topic-scheme";

export function handleStableCoinCreated(event: StableCoinCreatedEvent): void {
  fetchEvent(event, "StableCoinCreated");
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
