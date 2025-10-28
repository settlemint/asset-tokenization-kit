import { BondCreated } from "../../../generated/templates/BondFactory/BondFactory";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";
import {
  ActionName,
  createAction,
  createActionIdentifier,
} from "../../actions/actions";
import { fetchEvent } from "../../event/fetch/event";
import { updateTokenTypeStatsForTokenCreation } from "../../stats/token-type-stats";
import { fetchToken } from "../../token/fetch/token";
import { setBigNumber } from "../../utils/bignumber";
import { fetchBond } from "../bond/fetch/bond";

export function handleBondCreated(event: BondCreated): void {
  fetchEvent(event, "BondCreated");

  const token = fetchToken(event.params.tokenAddress);
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  token.save();

  setAccountContractName(event.params.tokenAddress, token.name);

  const bond = fetchBond(event.params.tokenAddress);
  const denominationAsset = fetchToken(event.params.denominationAsset);
  setBigNumber(
    bond,
    "faceValue",
    event.params.faceValue,
    denominationAsset.decimals
  );
  bond.maturityDate = event.params.maturityDate;
  bond.isMatured = false;
  bond.denominationAsset = event.params.denominationAsset;
  bond.save();

  // Update token type stats for token creation
  // Done here because it requires the denomination asset to be set
  updateTokenTypeStatsForTokenCreation(token);

  // Create MatureBond action
  const creator = fetchAccount(event.transaction.from);

  createAction(
    event.block.timestamp,
    ActionName.MatureBond,
    event.params.tokenAddress,
    bond.maturityDate,
    null,
    [creator.id],
    null,
    createActionIdentifier(ActionName.MatureBond, [event.params.tokenAddress])
  );
}
