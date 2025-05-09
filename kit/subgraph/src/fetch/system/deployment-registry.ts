import { Address } from "@graphprotocol/graph-ts";
import { System_DeploymentRegistry } from "../../../generated/schema";
import { fetchAccessControl } from "../accesscontrol";
import { fetchAddress } from "../address";

export function fetchDeploymentRegistry(
  address: Address
): System_DeploymentRegistry {
  let deploymentRegistry = System_DeploymentRegistry.load(address);

  if (!deploymentRegistry) {
    deploymentRegistry = new System_DeploymentRegistry(address);

    const accessControl = fetchAccessControl(address);
    deploymentRegistry.asAccessControl = accessControl.id;

    const addressEntity = fetchAddress(address);
    deploymentRegistry.asAddress = addressEntity.id;

    deploymentRegistry.save();
  }

  return deploymentRegistry;
}
