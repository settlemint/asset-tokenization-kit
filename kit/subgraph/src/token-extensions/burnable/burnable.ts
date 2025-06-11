import { BurnCompleted } from "../../../generated/templates/Burnable/Burnable";
import { fetchEvent } from "../../event/fetch/event";
import { decreaseTokenBalanceValue } from "../../token-balance/utils/token-balance-utils";
import { fetchToken } from "../../token/fetch/token";
import { decreaseTokenSupply } from "../../token/utils/token-utils";

export function handleBurnCompleted(event: BurnCompleted): void {
  fetchEvent(event, "BurnCompleted");
  const token = fetchToken(event.address);
  decreaseTokenSupply(token, event.params.amount);
  decreaseTokenBalanceValue(token, event.params.from, event.params.amount);
}
