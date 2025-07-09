import {
  BondMatured,
  BondRedeemed,
} from "../../../generated/templates/Bond/Bond";
import { fetchEvent } from "../../event/fetch/event";
import { fetchBond } from "./fetch/bond";
import { executeAction } from "../../actions/action-utils";
import { Bytes, log } from "@graphprotocol/graph-ts";

export function handleBondMatured(event: BondMatured): void {
  fetchEvent(event, "BondMatured");
  const bond = fetchBond(event.address);
  bond.isMatured = true;
  bond.save();
  
  // Mark mature bond action as executed
  // const actionId = event.address.concat(Bytes.fromUTF8("mature"));
  // const actionExecuted = executeAction(actionId, event.block.timestamp, event.transaction.from);
  // if (!actionExecuted) {
  //   log.warning("Failed to execute mature bond action: {}", [event.address.toHexString()]);
  // }
}

export function handleBondRedeemed(event: BondRedeemed): void {
  fetchEvent(event, "BondRedeemed");
}
