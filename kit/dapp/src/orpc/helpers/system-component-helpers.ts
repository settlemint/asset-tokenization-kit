import type { AccessControl } from "@/lib/fragments/the-graph/access-control-fragment";
import {
  type EthereumAddress,
  getEthereumAddress,
} from "@atk/zod/ethereum-address";
import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

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
    logger.error("parseSystemComponent: component is null or undefined");
    return null;
  }

  // Check if it has the required structure
  if (!hasId(component) || !hasAccessControl(component)) {
    logger.error(
      "parseSystemComponent: component missing required properties",
      {
        hasId: hasId(component),
        hasAccessControl: hasAccessControl(component),
        component: JSON.stringify(component),
      }
    );
    return null;
  }

  // Validate the id is a string
  if (typeof component.id !== "string") {
    logger.error("parseSystemComponent: component.id is not a string", {
      idType: typeof component.id,
      id: component.id,
    });
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
  } catch (error) {
    // Invalid ethereum address
    logger.error("parseSystemComponent: invalid ethereum address", {
      id: component.id,
      error: error instanceof Error ? error.message : String(error),
    });
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
    logger.error("getComponentId: component is null or missing id", {
      component: component ? JSON.stringify(component) : "null",
      hasId: component ? hasId(component) : false,
    });
    return null;
  }

  if (typeof component.id !== "string") {
    logger.error("getComponentId: component.id is not a string", {
      idType: typeof component.id,
      id: component.id,
    });
    return null;
  }

  try {
    return getEthereumAddress(component.id);
  } catch (error) {
    logger.error("getComponentId: invalid ethereum address", {
      id: component.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
