import { BigInt } from "@graphprotocol/graph-ts";
import { TokenBalance } from "../../../generated/schema";
import {
  BondMatured,
  BondRedeemed,
} from "../../../generated/templates/Bond/Bond";
import { fetchAccount } from "../../account/fetch/account";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import {
  ActionName,
  actionExecuted,
  createAction,
  createActionIdentifier,
} from "../../utils/actions";
import { fetchBond } from "./fetch/bond";

export function handleBondMatured(event: BondMatured): void {
  fetchEvent(event, "BondMatured");
  const bond = fetchBond(event.address);
  bond.isMatured = true;
  bond.save();

  // Mark the MatureBond action as executed
  actionExecuted(
    event,
    ActionName.MatureBond,
    event.address,
    createActionIdentifier(ActionName.MatureBond, event.address)
  );

  // Create RedeemBond actions for all holders
  const token = fetchToken(event.address);
  const balances = token.balances.load();
  for (let i = 0; i < balances.length; i++) {
    const balance = balances[i];
    createAction(
      event,
      ActionName.RedeemBond,
      event.address,
      bond.maturityDate,
      null,
      [balance.account],
      null,
      createActionIdentifier(
        ActionName.RedeemBond,
        event.address,
        balance.account
      )
    );
  }
}

export function handleBondRedeemed(event: BondRedeemed): void {
  fetchEvent(event, "BondRedeemed");

  const token = fetchToken(event.address);
  const account = fetchAccount(event.params.holder);
  const tokenBalance = TokenBalance.load(token.id.concat(account.id));

  if (tokenBalance == null || tokenBalance.valueExact.le(BigInt.zero())) {
    actionExecuted(
      event,
      ActionName.RedeemBond,
      event.address,
      createActionIdentifier(
        ActionName.RedeemBond,
        event.address,
        event.params.holder
      )
    );
  }
}
