import { Burnable as BurnableTemplate } from "../../generated/templates";
import {
  TokenAssetCreated,
  TokenImplementationUpdated,
} from "../../generated/templates/TokenFactory/TokenFactory";
import { fetchAccessControl } from "../access-control/fetch/accesscontrol";
import { InterfaceIds } from "../erc165/utils/interfaceids";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "../identity/fetch/identity";
import { fetchBond } from "../token-assets/bond/fetch/bond";
import { fetchFund } from "../token-assets/fund/fetch/fund";
import { fetchCapped } from "../token-extensions/capped/fetch/capped";
import { fetchCollateral } from "../token-extensions/collateral/fetch/collateral";
import { fetchCustodian } from "../token-extensions/custodian/fetch/custodian";
import { fetchPausable } from "../token-extensions/pausable/fetch/pausable";
import { fetchRedeemable } from "../token-extensions/redeemable/fetch/redeemable";
import { fetchYield } from "../token-extensions/yield/fetch/yield";
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

  if (event.params.interfaces.includes(InterfaceIds.ISMARTPausable)) {
    token.pausable = fetchPausable(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTBurnable)) {
    BurnableTemplate.create(event.params.tokenAddress);
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTCustodian)) {
    fetchCustodian(event.params.tokenAddress);
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTCollateral)) {
    token.collateral = fetchCollateral(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTCapped)) {
    token.capped = fetchCapped(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTYield)) {
    token.yield_ = fetchYield(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTRedeemable)) {
    token.redeemable = fetchRedeemable(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.IATKBond)) {
    token.bond = fetchBond(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.IATKFund)) {
    token.fund = fetchFund(event.params.tokenAddress).id;
    token.save();
  }

  token.save();
}

export function handleTokenImplementationUpdated(
  event: TokenImplementationUpdated
): void {
  fetchEvent(event, "TokenImplementationUpdated");
}
