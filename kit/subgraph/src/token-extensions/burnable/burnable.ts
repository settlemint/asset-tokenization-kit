import { BurnCompleted } from "../../../generated/templates/Burnable/Burnable";
import { fetchEvent } from "../../event/fetch/event";
import { updateSystemStatsForSupplyChange } from "../../stats/system-stats";
import { decreaseTokenBalanceValue } from "../../token-balance/utils/token-balance-utils";
import { fetchToken } from "../../token/fetch/token";
import { decreaseTokenSupply } from "../../token/utils/token-utils";
import { toBigDecimal } from "../../utils/token-decimals";

export function handleBurnCompleted(event: BurnCompleted): void {
  fetchEvent(event, "BurnCompleted");
  const token = fetchToken(event.address);
  decreaseTokenSupply(token, event.params.amount);
  decreaseTokenBalanceValue(
    token,
    event.params.from,
    event.params.amount,
    event.block.timestamp
  );

  // Update system stats (negative delta for burn)
  const supplyDelta = toBigDecimal(event.params.amount, token.decimals).neg();
  updateSystemStatsForSupplyChange(token, supplyDelta, event.block.timestamp);
}
