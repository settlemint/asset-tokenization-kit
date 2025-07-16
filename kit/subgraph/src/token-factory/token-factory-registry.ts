import { Bytes, log } from "@graphprotocol/graph-ts";
import {
  BondFactory as BondFactoryTemplate,
  FundFactory as FundFactoryTemplate,
} from "../../generated/templates";
import {
  TokenFactoryImplementationUpdated as TokenFactoryImplementationUpdatedEvent,
  TokenFactoryRegistered as TokenFactoryRegisteredEvent,
} from "../../generated/templates/TokenFactoryRegistry/TokenFactoryRegistry";
import { InterfaceIds } from "../erc165/utils/interfaceids";
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
  tokenFactory.extensions = getFactoryExtensions(
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

function getFactoryExtensions(implementationInterfaces: Bytes[]): string[] {
  const extensions: Array<string> = [];
  for (let i = 0; i < implementationInterfaces.length; i++) {
    const interfaceId = implementationInterfaces[i];
    if (interfaceId.equals(InterfaceIds.ISMARTPausable)) {
      extensions.push("PAUSABLE");
    } else if (interfaceId.equals(InterfaceIds.ISMARTBurnable)) {
      extensions.push("BURNABLE");
    } else if (interfaceId.equals(InterfaceIds.ISMARTCustodian)) {
      extensions.push("CUSTODIAN");
    } else if (interfaceId.equals(InterfaceIds.ISMARTCollateral)) {
      extensions.push("COLLATERAL");
    } else if (interfaceId.equals(InterfaceIds.ISMARTCapped)) {
      extensions.push("CAPPED");
    } else if (interfaceId.equals(InterfaceIds.ISMARTYield)) {
      extensions.push("YIELD");
    } else if (interfaceId.equals(InterfaceIds.ISMARTRedeemable)) {
      extensions.push("REDEEMABLE");
    } else {
      log.warning("Unknown interface: {}", [interfaceId.toHexString()]);
    }
  }

  return extensions;
}
