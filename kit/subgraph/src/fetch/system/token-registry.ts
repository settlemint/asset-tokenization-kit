import { Address } from "@graphprotocol/graph-ts";
import { System, System_TokenRegistry } from "../../../generated/schema";
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
    tokenRegistry.asAccount = account.id;

    tokenRegistry.save();
  }

  return tokenRegistry;
}
