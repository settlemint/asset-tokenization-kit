import {
  BondCreated,
  BondMatured,
  BondRedeemed,
} from "../../generated/templates/Bond/Bond";
import { fetchEvent } from "../event/fetch/event";
import { setBigNumber } from "../utils/bignumber";
import { fetchBond } from "./fetch/bond";

export function handleBondCreated(event: BondCreated): void {
  fetchEvent(event, "BondCreated");
  const bond = fetchBond(event.address);
  setBigNumber(
    bond,
    "faceValue",
    event.params.faceValue,
    event.params.decimals
  );
  //setBigNumber(bond, "totalUnderlyingNeeded", event.params.totalUnderlyingNeeded, event.params.decimals);
  bond.maturityDate = event.params.maturityDate;
  bond.isMatured = false;
  bond.save();
}

export function handleBondMatured(event: BondMatured): void {
  fetchEvent(event, "BondMatured");
  const bond = fetchBond(event.address);
  bond.isMatured = true;
  bond.save();
}

export function handleBondRedeemed(event: BondRedeemed): void {
  fetchEvent(event, "BondRedeemed");
}
