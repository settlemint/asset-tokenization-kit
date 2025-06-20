import { BondCreated } from "../../../generated/templates/BondFactory/BondFactory";
import { fetchEvent } from "../../event/fetch/event";
import { setBigNumber } from "../../utils/bignumber";
import { fetchBond } from "../bond/fetch/bond";

export function handleBondCreated(event: BondCreated): void {
  fetchEvent(event, "BondCreated");
  const bond = fetchBond(event.params.tokenAddress);
  setBigNumber(
    bond,
    "faceValue",
    event.params.faceValue,
    event.params.decimals
  );
  bond.maturityDate = event.params.maturityDate;
  bond.isMatured = false;
  bond.underlyingAsset = event.params.underlyingAsset;
  bond.save();
}
