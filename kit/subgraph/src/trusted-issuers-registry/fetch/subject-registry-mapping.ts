import { Address, Bytes, store } from "@graphprotocol/graph-ts";
import { SubjectRegistryMapping } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";
import { fetchTrustedIssuersRegistry } from "./trusted-issuers-registry";

export function fetchSubjectRegistryMapping(
  metaRegistry: Address,
  subjectAddress: Address
): SubjectRegistryMapping {
  const subject = fetchAccount(subjectAddress);
  const mappingId = metaRegistry.concat(subject.id);

  let mapping = SubjectRegistryMapping.load(mappingId);
  if (!mapping) {
    mapping = new SubjectRegistryMapping(mappingId);
    mapping.metaRegistry = fetchTrustedIssuersRegistry(metaRegistry).id;
    mapping.subject = subject.id;
    mapping.deployedInTransaction = Bytes.empty();
  }

  return mapping;
}

export function removeSubjectRegistryMapping(
  metaRegistry: Address,
  subjectAddress: Address
): void {
  const subject = fetchAccount(subjectAddress);
  const mappingId = metaRegistry.concat(subject.id);
  store.remove("SubjectRegistryMapping", mappingId.toHexString());
}
