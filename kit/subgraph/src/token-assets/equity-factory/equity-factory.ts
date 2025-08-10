import { EquityCreated as EquityCreatedEvent } from "../../../generated/templates/EquityFactory/EquityFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { fetchAccount } from "../../account/fetch/account";

export function handleEquityCreated(event: EquityCreatedEvent): void {
  fetchEvent(event, "EquityCreated");
  const token = fetchToken(event.params.tokenAddress);
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  token.save();

  const account = fetchAccount(event.params.tokenAddress);
  if (account.isContract) {
    account.contractName = token.name;
    account.save();
  }
}
