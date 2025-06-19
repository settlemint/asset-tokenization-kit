import { Bytes } from "@graphprotocol/graph-ts";
import { ATKXvPSettlementCreated } from "../../../../generated/templates/XvPSettlementFactory/XvPSettlementFactory";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchXvPSettlement } from "./fetch/xvp-settlement";

export function handleATKXvPSettlementCreated(
  event: ATKXvPSettlementCreated
): void {
  fetchEvent(event, "XvPSettlementCreated");
  const xvpSettlement = fetchXvPSettlement(event.params.settlement);
  if (xvpSettlement.deployedInTransaction.equals(Bytes.empty())) {
    xvpSettlement.deployedInTransaction = event.transaction.hash;
    xvpSettlement.save();
  }
}
