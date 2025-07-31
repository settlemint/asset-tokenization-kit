import type { AccessControl } from "@/lib/fragments/the-graph/access-control-fragment";
import {
  getEthereumAddress,
  type EthereumAddress,
} from "@/lib/zod/validators/ethereum-address";

/**
 * Type guard to check if a value has an id property
 */
function hasId(value: unknown): value is { id: unknown } {
  return typeof value === "object" && value !== null && "id" in value;
}

/**
 * Type guard to check if a value has an accessControl property
 */
function hasAccessControl(value: unknown): value is { accessControl: unknown } {
  return (
    typeof value === "object" && value !== null && "accessControl" in value
  );
}

/**
 * Safely parses a system component (like systemAccessManager) from The Graph
 * @param component - The component object from The Graph query
 * @returns A properly typed SystemComponent or null if invalid
 */
export function parseSystemComponent(
  component: unknown
): { id: EthereumAddress; accessControl: AccessControl } | null {
  if (!component) {
    return null;
  }

  // Check if it has the required structure
  if (!hasId(component) || !hasAccessControl(component)) {
    return null;
  }

  // Validate the id is a string
  if (typeof component.id !== "string") {
    return null;
  }

  // Try to parse the ethereum address
  try {
    const id = getEthereumAddress(component.id);

    // Return with the accessControl as-is (it will be validated by GraphQL schema)
    return {
      id,
      accessControl: component.accessControl as AccessControl,
    };
  } catch {
    // Invalid ethereum address
    return null;
  }
}

/**
 * Safely gets the id from a component that might have an id property
 * @param component - The component object
 * @returns The ethereum address or null if invalid
 */
export function getComponentId(component: unknown): EthereumAddress | null {
  if (!component || !hasId(component)) {
    return null;
  }

  if (typeof component.id !== "string") {
    return null;
  }

  try {
    return getEthereumAddress(component.id);
  } catch {
    return null;
  }
}
