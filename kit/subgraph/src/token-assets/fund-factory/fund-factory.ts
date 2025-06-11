import { FundCreated } from "../../../generated/templates/FundFactory/FundFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchFund } from "../fund/fetch/fund";

export function handleFundCreated(event: FundCreated): void {
  fetchEvent(event, "FundCreated");
  const fund = fetchFund(event.params.tokenAddress);
  fund.managementFeeBps = event.params.managementFeeBps;
  fund.save();
}
