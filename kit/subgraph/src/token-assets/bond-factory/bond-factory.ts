import { BondCreated } from "../../../generated/templates/BondFactory/BondFactory";
import { fetchAccount } from "../../account/fetch/account";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import {
  ActionName,
  createAction,
  createActionIdentifier,
} from "../../utils/actions";
import { setBigNumber } from "../../utils/bignumber";
import { fetchBond } from "../bond/fetch/bond";

export function handleBondCreated(event: BondCreated): void {
  fetchEvent(event, "BondCreated");

  const token = fetchToken(event.params.tokenAddress);
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  token.save();

  const bond = fetchBond(event.params.tokenAddress);
  setBigNumber(
    bond,
    "faceValue",
    event.params.faceValue,
    event.params.decimals
  );
  bond.maturityDate = event.params.maturityDate;
  bond.isMatured = false;
  bond.denominationAsset = event.params.denominationAsset;
  bond.save();

  // Create MatureBond action
  const creator = fetchAccount(event.transaction.from);

  createAction(
    event,
    ActionName.MatureBond,
    event.params.tokenAddress,
    bond.maturityDate,
    null,
    [creator.id],
    null,
    createActionIdentifier(ActionName.MatureBond, event.params.tokenAddress)
  );
}
