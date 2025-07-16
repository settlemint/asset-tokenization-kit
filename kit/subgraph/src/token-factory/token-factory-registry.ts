import {
  BondFactory as BondFactoryTemplate,
  FundFactory as FundFactoryTemplate,
} from "../../generated/templates";
import {
  TokenFactoryImplementationUpdated as TokenFactoryImplementationUpdatedEvent,
  TokenFactoryRegistered as TokenFactoryRegisteredEvent,
} from "../../generated/templates/TokenFactoryRegistry/TokenFactoryRegistry";
import { fetchEvent } from "../event/fetch/event";
import { getTokenExtensions } from "../token-extensions/utils/token-extensions-utils";
import {
  getDecodedTypeId,
  getEncodedTypeId,
} from "../type-identifier/type-identifier";
import { fetchTokenFactory } from "./fetch/token-factory";
import { fetchTokenFactoryRegistry } from "./fetch/token-factory-registry";

export function handleTokenFactoryImplementationUpdated(
  event: TokenFactoryImplementationUpdatedEvent
): void {
  fetchEvent(event, "TokenFactoryImplementationUpdated");
}

export function handleTokenFactoryRegistered(
  event: TokenFactoryRegisteredEvent
): void {
  fetchEvent(event, "TokenFactoryRegistered");
  const tokenFactory = fetchTokenFactory(event.params.proxyAddress);
  tokenFactory.name = event.params.name;
  tokenFactory.typeId = getDecodedTypeId(event.params.typeId);
  tokenFactory.extensions = getTokenExtensions(
    event.params.tokenImplementationInterfaces
  );

  if (event.params.typeId.equals(getEncodedTypeId("ATKBondFactory"))) {
    BondFactoryTemplate.create(event.params.proxyAddress);
  }
  if (event.params.typeId.equals(getEncodedTypeId("ATKFundFactory"))) {
    FundFactoryTemplate.create(event.params.proxyAddress);
  }

  tokenFactory.tokenFactoryRegistry = fetchTokenFactoryRegistry(
    event.address
  ).id;
  tokenFactory.save();
}
