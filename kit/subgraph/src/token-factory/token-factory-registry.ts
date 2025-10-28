import {
  BondFactory as BondFactoryTemplate,
  FundFactory as FundFactoryTemplate,
} from "../../generated/templates";
import {
  TokenFactoryImplementationUpdated as TokenFactoryImplementationUpdatedEvent,
  TokenFactoryRegistered as TokenFactoryRegisteredEvent,
} from "../../generated/templates/TokenFactoryRegistry/TokenFactoryRegistry";
import { checkSupportsInterface } from "../erc165/erc165";
import { InterfaceIds } from "../erc165/utils/interfaceids";
import { fetchEvent } from "../event/fetch/event";
import { getTokenExtensions } from "../token-extensions/utils/token-extensions-utils";
import {
  getDecodedTypeId,
  getEncodedTypeId,
} from "../type-identifier/type-identifier";
import { fetchTokenFactory } from "./fetch/token-factory";
import { setAccountContractName } from "../account/utils/account-contract-name";
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
  tokenFactory.tokenExtensions = getTokenExtensions(
    event.params.tokenImplementationInterfaces
  );
  tokenFactory.tokenImplementsERC3643 = checkSupportsInterface(
    event.params.tokenImplementationAddress,
    InterfaceIds.IERC3643
  );
  tokenFactory.tokenImplementsSMART = checkSupportsInterface(
    event.params.tokenImplementationAddress,
    InterfaceIds.ISMART
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

  // Persist a human-readable name on the underlying account
  setAccountContractName(event.params.proxyAddress, tokenFactory.name);
}
