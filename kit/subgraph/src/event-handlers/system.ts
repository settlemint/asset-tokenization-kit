import {
  Bootstrapped,
  ComplianceImplementationUpdated,
  EtherWithdrawn,
  IdentityFactoryImplementationUpdated,
  IdentityImplementationUpdated,
  IdentityRegistryImplementationUpdated,
  IdentityRegistryStorageImplementationUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenIdentityImplementationUpdated,
  TrustedIssuersRegistryImplementationUpdated,
} from "../../generated/templates/System/System";
import { fetchCompliance } from "../fetch/compliance";
import { fetchIdentityFactory } from "../fetch/identity-factory";
import { fetchIdentityRegistry } from "../fetch/identity-registry";
import { fetchIdentityRegistryStorage } from "../fetch/identity-registry-storage";
import { fetchSystem } from "../fetch/system";
import { fetchTrustedIssuersRegistry } from "../fetch/trusted-issuers-registry";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";
import { processEvent } from "../shared/event/event";

/**
 * Handles the "Bootstrapped" event by updating the system entity with references to core component implementations.
 *
 * Updates the system's compliance, identity factory, identity registry, identity registry storage, and trusted issuers registry references using the proxies provided in the event parameters.
 */
export function handleBootstrapped(event: Bootstrapped): void {
  processEvent(event, "Bootstrapped");
  const system = fetchSystem(event.address);
  system.compliance = fetchCompliance(event.params.complianceProxy).id;
  system.identityFactory = fetchIdentityFactory(
    event.params.identityFactoryProxy
  ).id;
  system.identityRegistry = fetchIdentityRegistry(
    event.params.identityRegistryProxy
  ).id;
  system.identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params.identityRegistryStorageProxy
  ).id;
  system.trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params.trustedIssuersRegistryProxy
  ).id;
  system.save();
}

/**
 * Updates the system's compliance implementation reference in response to a ComplianceImplementationUpdated event.
 *
 * Replaces the current compliance implementation ID in the system entity with the new implementation specified in the event.
 */
export function handleComplianceImplementationUpdated(
  event: ComplianceImplementationUpdated
): void {
  processEvent(event, "ComplianceImplementationUpdated");
  const system = fetchSystem(event.address);
  system.compliance = fetchCompliance(event.params.newImplementation).id;
  system.save();
}

export function handleEtherWithdrawn(event: EtherWithdrawn): void {
  processEvent(event, "EtherWithdrawn");
}

/**
 * Updates the system entity with the new identity factory implementation from the event.
 *
 * Replaces the system's identity factory reference with the ID of the new implementation and saves the updated system entity.
 */
export function handleIdentityFactoryImplementationUpdated(
  event: IdentityFactoryImplementationUpdated
): void {
  processEvent(event, "IdentityFactoryImplementationUpdated");
  const system = fetchSystem(event.address);
  system.identityFactory = fetchIdentityFactory(
    event.params.newImplementation
  ).id;
  system.save();
}

/**
 * Handles the "IdentityImplementationUpdated" event without modifying system state.
 *
 * Records the occurrence of an identity implementation update event.
 */
export function handleIdentityImplementationUpdated(
  event: IdentityImplementationUpdated
): void {
  processEvent(event, "IdentityImplementationUpdated");
}

/**
 * Updates the system entity with the new identity registry implementation from the event.
 *
 * Replaces the system's identity registry reference with the ID of the new implementation and saves the updated system entity.
 */
export function handleIdentityRegistryImplementationUpdated(
  event: IdentityRegistryImplementationUpdated
): void {
  processEvent(event, "IdentityRegistryImplementationUpdated");
  const system = fetchSystem(event.address);
  system.identityRegistry = fetchIdentityRegistry(
    event.params.newImplementation
  ).id;
  system.save();
}

/**
 * Updates the system entity with the new identity registry storage implementation when the corresponding event is received.
 *
 * @param event - The IdentityRegistryStorageImplementationUpdated event containing the new implementation address.
 */
export function handleIdentityRegistryStorageImplementationUpdated(
  event: IdentityRegistryStorageImplementationUpdated
): void {
  processEvent(event, "IdentityRegistryStorageImplementationUpdated");
  const system = fetchSystem(event.address);
  system.identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params.newImplementation
  ).id;
  system.save();
}

/**
 * Handles the "RoleAdminChanged" event by delegating to the shared role admin change handler.
 */
export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  roleAdminChangedHandler(event);
}

export function handleRoleGranted(event: RoleGranted): void {
  roleGrantedHandler(event, event.params.role, event.params.account);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  roleRevokedHandler(event, event.params.role, event.params.account);
}

export function handleTokenIdentityImplementationUpdated(
  event: TokenIdentityImplementationUpdated
): void {
  processEvent(event, "TokenIdentityImplementationUpdated");
}

/**
 * Updates the system entity with a new trusted issuers registry implementation when the corresponding event is received.
 *
 * @param event - The event containing the new trusted issuers registry implementation address.
 */
export function handleTrustedIssuersRegistryImplementationUpdated(
  event: TrustedIssuersRegistryImplementationUpdated
): void {
  processEvent(event, "TrustedIssuersRegistryImplementationUpdated");
  const system = fetchSystem(event.address);
  system.trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params.newImplementation
  ).id;
  system.save();
}
