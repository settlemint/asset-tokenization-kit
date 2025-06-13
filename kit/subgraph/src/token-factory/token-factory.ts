import {
  TokenAssetCreated,
  TokenImplementationUpdated,
} from "../../generated/templates/TokenFactory/TokenFactory";
import { fetchAccessControl } from "../access-control/fetch/accesscontrol";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "../identity/fetch/identity";
import { fetchToken } from "../token/fetch/token";
import { fetchTokenFactory } from "./fetch/token-factory";

export function handleTokenAssetCreated(event: TokenAssetCreated): void {
  fetchEvent(event, "TokenAssetCreated");
  const tokenFactory = fetchTokenFactory(event.address);
  const token = fetchToken(event.params.tokenAddress);
  token.tokenFactory = tokenFactory.id;
  token.type = tokenFactory.name;
  token.identity = fetchIdentity(event.params.tokenIdentity).id;
  token.accessControl = fetchAccessControl(event.params.accessManager).id;
  token.save();
}

export function handleTokenImplementationUpdated(
  event: TokenImplementationUpdated
): void {
  fetchEvent(event, "TokenImplementationUpdated");
}
