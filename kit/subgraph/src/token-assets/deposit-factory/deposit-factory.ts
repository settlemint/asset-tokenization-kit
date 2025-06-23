import { DepositCreated as DepositCreatedEvent } from "../../../generated/templates/DepositFactory/DepositFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";

export function handleDepositCreated(event: DepositCreatedEvent): void {
  fetchEvent(event, "DepositCreated");
  const token = fetchToken(event.params.tokenAddress);
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  token.requiredClaimTopics = event.params.requiredClaimTopics;
  token.save();
}
