import {
  BondMatured,
  BondRedeemed,
} from "../../../generated/templates/Bond/Bond";
import { fetchEvent } from "../../event/fetch/event";
import { fetchBond } from "./fetch/bond";
import { ActionName, actionExecuted } from "../../utils/actions";

export function handleBondMatured(event: BondMatured): void {
  fetchEvent(event, "BondMatured");
  const bond = fetchBond(event.address);
  bond.isMatured = true;
  bond.save();

  // Mark the MatureBond action as executed
  actionExecuted(event, ActionName.MatureBond, event.address, null);
}

export function handleBondRedeemed(event: BondRedeemed): void {
  fetchEvent(event, "BondRedeemed");
}
