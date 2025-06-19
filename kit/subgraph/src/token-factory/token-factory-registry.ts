import { ByteArray, crypto } from "@graphprotocol/graph-ts";
import { fetchEvent } from "../event/fetch/event";
import {
  TokenFactoryImplementationUpdated as TokenFactoryImplementationUpdatedEvent,
  TokenFactoryRegistered as TokenFactoryRegisteredEvent,
} from "../generated/TokenFactoryRegistry/TokenFactoryRegistry";
import { fetchSystem } from "../system/fetch/system";
import { fetchTokenFactory } from "./fetch/token-factory";

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

  tokenFactory.system = fetchSystem(event.address).id;
  tokenFactory.save();
}
