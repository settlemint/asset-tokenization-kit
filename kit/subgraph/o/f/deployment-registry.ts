import { Address } from "@graphprotocol/graph-ts";
import { System } from "../../../generated/schema";
import { SMARTDeploymentRegistry } from "../../../generated/SMARTDeploymentRegistry/SMARTDeploymentRegistry";
import { fetchAccessControl } from "../accesscontrol";

export function fetchDeploymentRegistry(address: Address): System {
  let deploymentRegistry = System.load(address);

  if (!deploymentRegistry) {
    deploymentRegistry = new System(address);
    const accessControl = fetchAccessControl(
      address,
      SMARTDeploymentRegistry.bind(address)
    );
    deploymentRegistry.accessControl = accessControl.id;
    deploymentRegistry.save();
  }

  return deploymentRegistry;
}
