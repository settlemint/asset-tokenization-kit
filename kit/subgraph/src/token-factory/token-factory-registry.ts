import {
  BondFactory as BondFactoryTemplate,
  FundFactory as FundFactoryTemplate,
} from "../../generated/templates";
import {
  TokenFactoryImplementationUpdated as TokenFactoryImplementationUpdatedEvent,
  TokenFactoryRegistered as TokenFactoryRegisteredEvent,
} from "../../generated/templates/TokenFactoryRegistry/TokenFactoryRegistry";
import { fetchEvent } from "../event/fetch/event";
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

  event.params.implementationAddress; // Implementation address, we can check on this contract if it implements certain capabilities

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
