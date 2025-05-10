import { Address } from "@graphprotocol/graph-ts";
import { System } from "../../../generated/schema";

export function fetchDeploymentRegistry(address: Address): System {
  let deploymentRegistry = System.load(address);

  if (!deploymentRegistry) {
    deploymentRegistry = new System(address);

    deploymentRegistry.save();
  }

  return deploymentRegistry;
}
