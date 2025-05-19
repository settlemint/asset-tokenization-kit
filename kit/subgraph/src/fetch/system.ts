import { Address } from "@graphprotocol/graph-ts";
import { System } from "../../generated/schema";
import { System as SystemContract } from "../../generated/templates/System/System";
import { fetchAccessControl } from "../shared/accesscontrol/fetch-accesscontrol";

export function fetchSystem(address: Address): System {
  let system = System.load(address);

  if (!system) {
    system = new System(address);
    const accessControl = fetchAccessControl(
      address,
      SystemContract.bind(address)
    );
    system.accessControl = accessControl.id;
    system.save();
  }

  return system;
}
