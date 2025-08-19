/**
 * Safely convert any value to a string
 * Handles objects by checking for toString method or using JSON.stringify
 */
export function safeToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (typeof value === "function") {
    return "[Function]";
  }

  if (typeof value === "object") {
    // Check if it has a meaningful toString method
    if (value instanceof Date) {
      return value.toISOString();
    }

    // For other objects, use JSON representation
    try {
      return JSON.stringify(value);
    } catch {
      return "[Object]";
    }
  }

  // This should never be reached, but satisfies TypeScript
  return "[Unknown]";
}
