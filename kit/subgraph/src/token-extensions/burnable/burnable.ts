import { BurnCompleted } from "../../../generated/templates/Burnable/Burnable";
import { fetchEvent } from "../../event/fetch/event";
import { updateAccountStatsForBalanceChange } from "../../stats/account-stats";
import { updateSystemStatsForSupplyChange } from "../../stats/system-stats";
import { decreaseTokenBalanceValue } from "../../token-balance/utils/token-balance-utils";
import { fetchToken } from "../../token/fetch/token";
import { decreaseTokenSupply } from "../../token/utils/token-utils";
import { toBigDecimal } from "../../utils/token-decimals";

export function handleBurnCompleted(event: BurnCompleted): void {
  fetchEvent(event, "BurnCompleted");
  const token = fetchToken(event.address);

  // Execute the burn
  decreaseTokenSupply(token, event.params.amount);
  decreaseTokenBalanceValue(
    token,
    event.params.from,
    event.params.amount,
    event.block.timestamp
  );

  const amountDelta = toBigDecimal(event.params.amount, token.decimals).neg();

  // Update system stats (negative delta for burn)
  updateSystemStatsForSupplyChange(token, amountDelta);

  // Update account stats (negative delta for burn)
  updateAccountStatsForBalanceChange(event.params.from, token, amountDelta);
}
