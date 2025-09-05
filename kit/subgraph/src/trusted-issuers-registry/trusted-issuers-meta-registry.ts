import {
  SubjectRegistrySet as SubjectRegistrySetEvent,
  SystemRegistrySet as SystemRegistrySetEvent,
} from "../../generated/TrustedIssuersMetaRegistry/TrustedIssuersMetaRegistry";
import { fetchEvent } from "../event/fetch/event";
import { fetchTrustedIssuersRegistry } from "./fetch/trusted-issuers-registry";

export function handleSystemRegistrySet(event: SystemRegistrySetEvent): void {
  fetchEvent(event, "SystemRegistrySet");

  const trustedIssuerRegistry = fetchTrustedIssuersRegistry(event.address);
  trustedIssuerRegistry.systemRegistry = event.params.newRegistry;
  trustedIssuerRegistry.save();
}

export function handleSubjectRegistrySet(event: SubjectRegistrySetEvent): void {
  fetchEvent(event, "SubjectRegistrySet");

  // Subject registry mapping is a separate entity derived via relationships.
  // If additional indexing is needed, implement mapping creation here.
}
