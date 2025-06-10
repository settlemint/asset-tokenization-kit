import { BondCreated } from "../../generated/templates/BondFactory/BondFactory";
import { fetchBond } from "../bond/fetch/bond";
import { fetchEvent } from "../event/fetch/event";
import { setBigNumber } from "../utils/bignumber";

export function handleBondCreated(event: BondCreated): void {
  fetchEvent(event, "BondCreated");
  const bond = fetchBond(event.address);
  setBigNumber(
    bond,
    "faceValue",
    event.params.faceValue,
    event.params.decimals
  );
  bond.maturityDate = event.params.maturityDate;
  bond.isMatured = false;
  bond.save();
}
