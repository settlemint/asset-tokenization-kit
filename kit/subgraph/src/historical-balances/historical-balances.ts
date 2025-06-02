import { CheckpointUpdated } from "../../generated/templates/HistoricalBalances/HistoricalBalances";
import { updateTokenBalanceValue } from "../token-balance/utils/token-balance-utils";
import { fetchToken } from "../token/fetch/token";

export function handleCheckpointUpdated(event: CheckpointUpdated): void {
  const token = fetchToken(event.address);
  updateTokenBalanceValue(token, event.params.account, event.params.newBalance);
}
