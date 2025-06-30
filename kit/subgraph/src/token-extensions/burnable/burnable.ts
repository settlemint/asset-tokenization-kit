import { BurnCompleted } from "../../../generated/templates/Burnable/Burnable";
import { BigInt } from "@graphprotocol/graph-ts";
import { fetchEvent } from "../../event/fetch/event";
import { updateSystemStatsForSupplyChange } from "../../stats/system-stats";
import { updateAccountStatsForBalanceChange } from "../../stats/account-stats";
import { decreaseTokenBalanceValue } from "../../token-balance/utils/token-balance-utils";
import { fetchToken } from "../../token/fetch/token";
import { decreaseTokenSupply } from "../../token/utils/token-utils";
import { toBigDecimal } from "../../utils/token-decimals";
import { fetchTokenBalance } from "../../token-balance/fetch/token-balance";
import { fetchAccount } from "../../account/fetch/account";

export function handleBurnCompleted(event: BurnCompleted): void {
  fetchEvent(event, "BurnCompleted");
  const token = fetchToken(event.address);
  
  // Get balance state before burn
  const account = fetchAccount(event.params.from);
  const balanceBefore = fetchTokenBalance(token, account);
  const hadBalanceBefore = balanceBefore.valueExact.gt(BigInt.zero()) ? 1 : 0;
  
  // Execute the burn
  decreaseTokenSupply(token, event.params.amount);
  decreaseTokenBalanceValue(
    token,
    event.params.from,
    event.params.amount,
    event.block.timestamp
  );
  
  // Get balance state after burn
  const balanceAfter = fetchTokenBalance(token, account);
  const hasBalanceAfter = balanceAfter.valueExact.gt(BigInt.zero()) ? 1 : 0;

  // Update system stats (negative delta for burn)
  const supplyDelta = toBigDecimal(event.params.amount, token.decimals).neg();
  updateSystemStatsForSupplyChange(token, supplyDelta, event.block.timestamp);
  
  // Update account stats (negative delta for burn)
  updateAccountStatsForBalanceChange(
    event.params.from,
    token,
    supplyDelta,
    hadBalanceBefore,
    hasBalanceAfter,
    event.block.timestamp
  );
}
