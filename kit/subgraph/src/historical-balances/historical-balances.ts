import { CheckpointUpdated } from "../../generated/templates/HistoricalBalances/HistoricalBalances";
import { fetchEvent } from "../event/fetch/event";
import { updateTokenBalanceValue } from "../token-balance/utils/token-balance-utils";
import { fetchToken } from "../token/fetch/token";

export function handleCheckpointUpdated(event: CheckpointUpdated): void {
  fetchEvent(event, "CheckpointUpdated");
  const token = fetchToken(event.address);
  updateTokenBalanceValue(token, event.params.account, event.params.newBalance);
}
