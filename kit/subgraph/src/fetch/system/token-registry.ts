import { Address } from "@graphprotocol/graph-ts";
import {
  System_DeploymentRegistry,
  System_TokenRegistry,
} from "../../../generated/schema";
import { fetchAddress } from "../address";

export function fetchTokenRegistry(
  address: Address,
  deploymentRegistry: System_DeploymentRegistry,
  typeName: string
): System_TokenRegistry {
  let tokenRegistry = System_TokenRegistry.load(address);

  if (!tokenRegistry) {
    tokenRegistry = new System_TokenRegistry(address);
    tokenRegistry.typeName = typeName;
    tokenRegistry.deploymentRegistry = deploymentRegistry.id;

    const addressEntity = fetchAddress(address);
    tokenRegistry.asAddress = addressEntity.id;

    tokenRegistry.save();
  }

  return tokenRegistry;
}
