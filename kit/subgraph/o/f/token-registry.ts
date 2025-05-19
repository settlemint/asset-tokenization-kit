import { Address } from "@graphprotocol/graph-ts";
import { System, System_TokenRegistry } from "../../../generated/schema";
import { TokenRegistry } from "../../../generated/templates/TokenRegistry/TokenRegistry";
import { fetchAccessControl } from "../accesscontrol";
import { fetchAccount } from "../account";

export function fetchTokenRegistry(
  address: Address,
  deploymentRegistry: System,
  typeName: string
): System_TokenRegistry {
  let tokenRegistry = System_TokenRegistry.load(address);

  if (!tokenRegistry) {
    tokenRegistry = new System_TokenRegistry(address);
    tokenRegistry.typeName = typeName;
    tokenRegistry.deploymentRegistry = deploymentRegistry.id;

    const account = fetchAccount(address);
    tokenRegistry.account = account.id;

    const accessControl = fetchAccessControl(
      address,
      TokenRegistry.bind(address)
    );
    tokenRegistry.accessControl = accessControl.id;

    tokenRegistry.save();
  }

  return tokenRegistry;
}
