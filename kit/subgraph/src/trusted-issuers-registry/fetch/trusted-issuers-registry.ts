import { Address, Bytes } from "@graphprotocol/graph-ts";
import { TrustedIssuersRegistry } from "../../../generated/schema";
import { TrustedIssuersRegistry as TrustedIssuersRegistryTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";

export function fetchTrustedIssuersRegistry(
  address: Address
): TrustedIssuersRegistry {
  let trustedIssuersRegistry = TrustedIssuersRegistry.load(address);

  if (!trustedIssuersRegistry) {
    trustedIssuersRegistry = new TrustedIssuersRegistry(address);
    trustedIssuersRegistry.account = fetchAccount(address).id;
    trustedIssuersRegistry.deployedInTransaction = Bytes.empty();
    trustedIssuersRegistry.save();
    TrustedIssuersRegistryTemplate.create(address);
  }

  return trustedIssuersRegistry;
}
