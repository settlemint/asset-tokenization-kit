import { ByteArray, crypto } from "@graphprotocol/graph-ts";
import {
  BondFactory as BondFactoryTemplate,
  FundFactory as FundFactoryTemplate,
} from "../../generated/templates";
import {
  TokenFactoryImplementationUpdated as TokenFactoryImplementationUpdatedEvent,
  TokenFactoryRegistered as TokenFactoryRegisteredEvent,
} from "../../generated/templates/TokenFactoryRegistry/TokenFactoryRegistry";
import { fetchEvent } from "../event/fetch/event";
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
  fetchEvent(event, "TokenFactoryCreated");
  const tokenFactory = fetchTokenFactory(event.params.proxyAddress);
  tokenFactory.name = event.params.name;
  tokenFactory.typeId = event.params.typeId;

  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKBondFactory"))
  ) {
    BondFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKFundFactory"))
  ) {
    FundFactoryTemplate.create(event.params.proxyAddress);
  }

  tokenFactory.tokenFactoryRegistry = fetchTokenFactoryRegistry(
    event.address
  ).id;
  tokenFactory.save();
}
