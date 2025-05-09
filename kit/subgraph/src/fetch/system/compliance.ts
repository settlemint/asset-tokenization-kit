import { Address } from "@graphprotocol/graph-ts";
import { System_Compliance } from "../../../generated/schema";
import { fetchAddress } from "../address";

export function fetchCompliance(address: Address): System_Compliance {
  let compliance = System_Compliance.load(address);

  if (!compliance) {
    compliance = new System_Compliance(address);

    const addressEntity = fetchAddress(address);
    compliance.asAddress = addressEntity.id;

    compliance.save();
  }

  return compliance;
}
