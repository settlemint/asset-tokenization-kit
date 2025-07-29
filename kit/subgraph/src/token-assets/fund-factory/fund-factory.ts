import { FundCreated } from "../../../generated/templates/FundFactory/FundFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { fetchFund } from "../fund/fetch/fund";

export function handleFundCreated(event: FundCreated): void {
  fetchEvent(event, "FundCreated");

  const token = fetchToken(event.params.tokenAddress);
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  token.save();

  const fund = fetchFund(event.params.tokenAddress);
  fund.managementFeeBps = event.params.managementFeeBps;
  fund.save();
}
