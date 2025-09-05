import { Address } from "@graphprotocol/graph-ts";
import {
  SubjectRegistrySet as SubjectRegistrySetEvent,
  SystemRegistrySet as SystemRegistrySetEvent,
} from "../../generated/templates/TrustedIssuersMetaRegistry/TrustedIssuersMetaRegistry";
import { fetchEvent } from "../event/fetch/event";
import {
  fetchSubjectRegistryMapping,
  removeSubjectRegistryMapping,
} from "./fetch/subject-registry-mapping";
import { fetchTrustedIssuersRegistry } from "./fetch/trusted-issuers-registry";

export function handleSystemRegistrySet(event: SystemRegistrySetEvent): void {
  fetchEvent(event, "SystemRegistrySet");

  const metaRegistry = fetchTrustedIssuersRegistry(event.address);
  metaRegistry.systemRegistry = event.params.newRegistry;
  metaRegistry.deployedInTransaction = event.transaction.hash;
  metaRegistry.save();
}

export function handleSubjectRegistrySet(event: SubjectRegistrySetEvent): void {
  fetchEvent(event, "SubjectRegistrySet");

  const metaRegistryAddress = event.address;
  const subjectAddress = event.params.subject;
  const registryAddress = event.params.newRegistry;

  if (registryAddress.equals(Address.zero())) {
    removeSubjectRegistryMapping(metaRegistryAddress, subjectAddress);
    return;
  }

  const mapping = fetchSubjectRegistryMapping(
    metaRegistryAddress,
    subjectAddress
  );
  mapping.registry = fetchTrustedIssuersRegistry(registryAddress).id;
  mapping.deployedInTransaction = event.transaction.hash;
  mapping.save();
}
