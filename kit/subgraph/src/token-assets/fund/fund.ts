import { ManagementFeeCollected } from "../../../generated/templates/Fund/Fund";
import { fetchEvent } from "../../event/fetch/event";
import { fetchFund } from "./fetch/fund";

export function handleManagementFeeCollected(
  event: ManagementFeeCollected
): void {
  fetchEvent(event, "ManagementFeeCollected");
  const fund = fetchFund(event.address);
  fund.lastFeeCollection = event.params.amount;
  fund.save();
}
