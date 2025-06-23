import { StableCoinCreated as StableCoinCreatedEvent } from "../../../generated/templates/StableCoinFactory/StableCoinFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";

export function handleStableCoinCreated(event: StableCoinCreatedEvent): void {
  fetchEvent(event, "StableCoinCreated");
  const token = fetchToken(event.params.tokenAddress);
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  token.requiredClaimTopics = event.params.requiredClaimTopics;
  token.save();
}
